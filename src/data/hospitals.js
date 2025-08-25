// src/data/hospitals.js
const LOGO = require('../../assets/icon.png'); // chỉnh đường dẫn nếu cần

export const getHospitals = () => {
  const hospitals = [
    {
      id: '1',
      name: 'Bệnh viện Đa khoa Vạn An',
      type: 'Bệnh viện',
      address: '352 Tuyến Tránh Quốc Lộ 1, Ấp 4, Xã Hướng Thọ Phú, TP. Tân An, Long An',
      phone: '0272 2220 115',
      email: 'benhvienvanan@gmail.com',
      website: 'https://benhvienvanan.com',
      rating: 4.9,
      totalReviews: 1250,
      specialties: ['Nội khoa', 'Ngoại khoa', 'Sản phụ khoa', 'Nhi khoa'],
      services: [
        'Khám nội khoa',
        'Khám ngoại khoa', 
        'Sản phụ khoa',
        'Nhi khoa',
        'Cấp cứu 24/7',
        'Xét nghiệm máu',
        'Chụp X-Quang',
        'Siêu âm tổng quát'
      ],
      workingHours: '24/24',
      location: { province: 'Long An', district: 'Tân An' },
      insurance: { bhyt: true },
      description: 'Bệnh viện đa khoa tại Long An, cấp cứu 24/7.'
    },
    {
      id: '2',
      name: 'Phòng khám Đa khoa Vạn An 1',
      type: 'Phòng khám',
      address: '26A Bạch Đằng, Phường 2, TP. Tân An, Long An',
      phone: '0272 3525 678',
      email: 'vanan1@healthcare.vn',
      website: 'https://vanan1.healthcare.vn',
      rating: 4.8,
      totalReviews: 680,
      specialties: ['Nội khoa', 'Ngoại khoa', 'Nhi khoa', 'Răng hàm mặt'],
      services: [
        'Khám nội khoa',
        'Khám ngoại khoa',
        'Nhi khoa', 
        'Răng hàm mặt',
        'Xét nghiệm cơ bản',
        'Tiêm chủng',
        'Khám sức khỏe tổng quát'
      ],
      workingHours: '06:00 - 20:00',
      location: { province: 'Long An', district: 'Tân An' },
      insurance: { bhyt: true },
      description: 'Phòng khám đa khoa phục vụ 7 ngày/tuần.'
    },
    {
      id: '3',
      name: 'Phòng khám Đa khoa Vạn An 2',
      type: 'Phòng khám',
      address: '198 KDC Mai Thị Non, Đường Nguyễn Hữu Thọ, TT. Bến Lức, H. Bến Lức, Long An',
      phone: '0272 2235 678',
      email: 'vanan2@healthcare.vn',
      website: 'https://vanan2.healthcare.vn',
      rating: 4.8,
      totalReviews: 420,
      specialties: ['Nội khoa', 'Phụ khoa', 'Y học cổ truyền', 'Tai mũi họng'],
      services: [
        'Khám nội khoa',
        'Phụ khoa',
        'Y học cổ truyền',
        'Tai mũi họng',
        'Châm cứu',
        'Bấm huyệt',
        'Tư vấn sức khỏe'
      ],
      workingHours: '06:00 - 20:00',
      location: { province: 'Long An', district: 'Bến Lức' },
      insurance: { bhyt: true },
      description: 'Phòng khám phục vụ khu vực Bến Lức.'
    }
  ];

  // ép tất cả dùng chung logo
  return hospitals.map(h => ({ ...h, image: LOGO }));
};

export const getHospitalById = (id) => {
  return getHospitals().find(h => h.id === id);
};