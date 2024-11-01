import React, { useState, useEffect } from 'react';
import { Card, Input, Button, notification, Typography, Table, Row, Col, Popconfirm } from 'antd';
import { EnvironmentOutlined, DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../../../../api';
import EmptyData from '../../../../Ultils/EmptyData/EmptyData';

const { Title } = Typography;

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const QuanLyDiaDiem = () => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: ''
  });
  const [title, setTitle] = useState('');
  const [radius, setRadius] = useState(30);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [searchAddress, setSearchAddress] = useState('');
  const [layerControl, setLayerControl] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fillFormWithLocation = (location) => {
    setTitle(location.title);
    setRadius(location.R || 30);
    setCoordinates({
      latitude: location.latitude,
      longitude: location.longitude
    });
    setSelectedLocation(location);

    if (map && marker) {
      const position = [location.latitude, location.longitude];
      map.setView(position, 16);
      marker.setLatLng(position);
    }
  };

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const response = await api.post('api/hrm/shift-work/timekeeper/config-checkin-coordinate/get');
      if (response.data.status === 1) {
        setLocations(response.data.data.map((location, index) => ({
          ...location,
          key: index,
        })));
      } else {
        notification.error({
          message: 'Lỗi',
          description: 'Không thể tải danh sách địa điểm',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách địa điểm',
      });
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (coordinates.latitude && coordinates.longitude) {
      const lat = parseFloat(coordinates.latitude);
      const lng = parseFloat(coordinates.longitude);

      if (!isNaN(lat) && !isNaN(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180) {

        if (map && marker) {
          const position = [lat, lng];
          map.setView(position, 16);
          marker.setLatLng(position);
        }

        // Check if coordinates match any existing location
        const matchingLocation = locations.find(
          loc => loc.latitude === lat && loc.longitude === lng
        );

        if (matchingLocation) {
          setSelectedLocation(matchingLocation);
          setTitle(matchingLocation.title);
          setRadius(matchingLocation.R || 30);
        }
      }
    }
  }, [coordinates.latitude, coordinates.longitude, map, marker, locations]);

  useEffect(() => {
    let mapInstance = null;
    let markerInstance = null;

    const initializeMap = () => {
      const container = document.getElementById('map');

      // Check if container exists and map hasn't been initialized
      if (container && !mapInstance) {
        const defaultCoords = [10.859298, 106.641869];

        mapInstance = L.map('map', {
          center: defaultCoords,
          zoom: 13,
          scrollWheelZoom: true
        });

        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        });

        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri',
          maxZoom: 19
        });

        const baseMaps = {
          "Bản đồ": osmLayer,
          "Vệ tinh": satelliteLayer,
        };

        osmLayer.addTo(mapInstance);
        const control = L.control.layers(baseMaps).addTo(mapInstance);
        setLayerControl(control);

        L.control.scale({
          imperial: false,
          metric: true
        }).addTo(mapInstance);

        markerInstance = L.marker(defaultCoords, {
          draggable: true
        }).addTo(mapInstance);

        mapInstance.on('click', (e) => {
          const { lat, lng } = e.latlng;
          markerInstance.setLatLng([lat, lng]);
          setCoordinates({
            latitude: lat,
            longitude: lng
          });
          setTitle('Địa điểm mới');
          setSelectedLocation(null);
        });

        markerInstance.on('dragend', () => {
          const pos = markerInstance.getLatLng();
          setCoordinates({
            latitude: pos.lat,
            longitude: pos.lng
          });
          setTitle('Địa điểm mới');
          setSelectedLocation(null);
        });

        setTimeout(() => {
          mapInstance.invalidateSize();
        }, 100);

        setMap(mapInstance);
        setMarker(markerInstance);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (mapInstance) {
        mapInstance.remove();
        setMap(null);
        setMarker(null);
      }
    };
  }, []); // Empty dependency array sin

  useEffect(() => {
    if (map && locations.length > 0) {
      map.eachLayer((layer) => {
        if (layer instanceof L.Circle) {
          map.removeLayer(layer);
        }
      });

      locations.forEach(location => {
        if (location.latitude && location.longitude) {
          const circle = L.circle([location.latitude, location.longitude], {
            radius: location.R || 50,
            color: 'blue',
            fillColor: '#30f',
            fillOpacity: 0.2
          }).addTo(map);

          circle.bindPopup(`
            <b>Tên địa điểm:</b> ${location.title || 'Chưa đặt tên'}<br>
            <b>Vị trí:</b><br>
            Vĩ độ: ${location.latitude}<br>
            Kinh độ: ${location.longitude}<br>
            Bán kính: ${location.R || 50}m
          `);
        }
      });
    }
  }, [map, locations]);

  const searchLocation = async () => {
    if (!searchAddress.trim()) {
      notification.warning({
        message: '',
        description: 'Vui lòng nhập địa chỉ cần tìm',
      });
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const position = [parseFloat(result.lat), parseFloat(result.lon)];
        map.setView(position, 16);
        marker.setLatLng(position);
        setTitle('Địa điểm mới');
        setSelectedLocation(null);
        setCoordinates({
          latitude: position[0],
          longitude: position[1]
        });
        setTitle('Địa điểm mới');
        setSelectedLocation(null);
        notification.success({
          message: 'Thành công',
          description: 'Đã tìm thấy địa điểm',
        });
      } else {
        notification.warning({
          message: 'Không tìm thấy',
          description: 'Không tìm thấy địa điểm phù hợp',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Lỗi khi tìm kiếm địa điểm',
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const saveLocation = async () => {
    if (!coordinates.latitude || !coordinates.longitude) {
      notification.warning({
        message: 'Cảnh báo',
        description: 'Vui lòng chọn vị trí trên bản đồ hoặc nhập tọa độ',
      });
      return;
    }

    if (!title.trim()) {
      notification.warning({
        message: 'Cảnh báo',
        description: 'Vui lòng nhập tên địa điểm',
      });
      return;
    }

    setLoading(true);
    try {
      // Nếu có địa điểm được chọn (từ nút xem), xóa nó trước
      if (selectedLocation) {
        await api.post(`api/hrm/shift-work/timekeeper/config-checkin-coordinate/remove`, {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        });
      }

      // Thêm địa điểm mới
      const response = await api.post(`api/hrm/shift-work/timekeeper/config-checkin-coordinate/add`, {
        title: title,
        R: radius,
        latitude: parseFloat(coordinates.latitude),
        longitude: parseFloat(coordinates.longitude),
      });

      if (!response.status === 200) throw new Error('Lỗi khi lưu địa điểm');

      notification.success({
        message: 'Thành công',
        description: 'Đã lưu địa điểm thành công',
      });

      setTitle('');
      setSelectedLocation(null);
      fetchLocations();
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteLocation = async (location) => {
    try {
      const response = await api.post(`api/hrm/shift-work/timekeeper/config-checkin-coordinate/remove`, {
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (response.data.status !== 1) throw new Error('Lỗi khi xóa địa điểm');

      notification.success({
        message: 'Thành công',
        description: 'Đã xóa địa điểm thành công',
      });

      fetchLocations();
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể xóa địa điểm',
      });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      notification.error({
        message: 'Lỗi',
        description: 'Trình duyệt không hỗ trợ định vị',
      });
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 15);
        marker.setLatLng([latitude, longitude]);
        setCoordinates({
          latitude: latitude.toString(),
          longitude: longitude.toString()
        });
        setTitle('Vị trí hiện tại');
        setSelectedLocation(null);
        setLocationLoading(false);
      },

      (error) => {
        let errorMessage = 'Không thể lấy vị trí hiện tại';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Người dùng từ chối cấp quyền truy cập vị trí';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thông tin vị trí không khả dụng';
            break;
          case error.TIMEOUT:
            errorMessage = 'Yêu cầu vị trí đã hết thời gian chờ';
            break;
          default:
            errorMessage = 'Đã xảy ra lỗi không xác định khi lấy vị trí';
        }
        notification.error({
          message: 'Lỗi',
          description: errorMessage,
        });
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      align: 'center',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Tên địa điểm',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Vĩ độ',
      dataIndex: 'latitude',
      key: 'latitude',
      ellipsis: true,
    },
    {
      title: 'Kinh độ',
      dataIndex: 'longitude',
      key: 'longitude',
      ellipsis: true,
    },
    {
      title: 'Bán kính',
      dataIndex: 'R',
      key: 'R',
      align: 'right',
      render: (value) => `${value || 50}m`,
      width: 100,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => fillFormWithLocation(record)}
            style={{ marginRight: 8 }}
          >
            Xem
          </Button>
          <Popconfirm
            title="Xóa địa điểm"
            description="Bạn có chắc chắn muốn xóa địa điểm này?"
            onConfirm={() => deleteLocation(record)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <Title level={5}>
                <EnvironmentOutlined /> Bản đồ
              </Title>
            }
            size="small"
          >
            <Input.Group compact style={{ marginBottom: 16 }}>
              <Input
                style={{ width: 'calc(100% - 100px)' }}
                placeholder="Nhập địa chỉ cần tìm..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onPressEnter={searchLocation}
              />
              <Button
                icon={<SearchOutlined />}
                onClick={searchLocation}
                type="primary"
                loading={searchLoading}
              >
                Tìm
              </Button>
            </Input.Group>

            <div style={{ width: '100%', height: '400px', position: 'relative', marginBottom: 16 }}>
              <div
                id="map"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  borderRadius: 8,
                  border: '1px solid #f0f0f0'
                }}
              />
            </div>
          </Card>

          <Card
            title={<Title level={5}>Thông tin địa điểm</Title>}
            size="small"
            style={{ marginTop: 16 }}
          >
            <Button
              type="primary"
              icon={<EnvironmentOutlined />}
              onClick={getCurrentLocation}
              style={{ marginBottom: 16 }}
              loading={locationLoading}
            >
              Lấy vị trí hiện tại
            </Button>

            <Row gutter={16}>
              <Col span={12}>
                <label>Vĩ độ:</label>
                <Input
                  value={coordinates.latitude}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, latitude: e.target.value }))}
                  placeholder="Nhập vĩ độ..."
                  style={{ marginBottom: 16 }}
                />
              </Col>
              <Col span={12}>
                <label>Kinh độ:</label>
                <Input
                  value={coordinates.longitude}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, longitude: e.target.value }))}
                  placeholder="Nhập kinh độ..."
                  style={{ marginBottom: 16 }}
                />
              </Col>
            </Row>

            <label>Tên địa điểm:</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên địa điểm..."
              style={{ marginBottom: 16 }}
            />

            <label>Bán kính (mét):</label>
            <Input
              type="number"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value) || 0)}
              placeholder="Nhập bán kính (mét)..."
              style={{ marginBottom: 16 }}
              min={0}
            />

            <Button
              type="primary"
              block
              onClick={saveLocation}
              loading={loading}
            >
              {selectedLocation ? 'Cập nhật địa điểm' : 'Thêm địa điểm'}
            </Button>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={<Title level={5}>Danh sách địa điểm</Title>}
            size="small"
            bodyStyle={{ padding: 0 }}
          >
            <Table
              dataSource={locations}
              columns={columns}
              pagination={false}
              size="small"
              rowKey={(record, index) => index}
              style={{ width: '100%' }}
              locale={{
                emptyText: <EmptyData />, // Thay đổi thông báo "No Data"
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default QuanLyDiaDiem;