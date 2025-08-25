export const getServiceCategories = () => {
  return [
    {
      id: 'general',
      name: 'Khám tổng quát',
      description: 'Khám sức khỏe tổng quát, kiểm tra định kỳ',
      icon: 'medical',
      iconBg: '#4285F4',
      hasSubServices: true
    },
    {
      id: 'specialist',
      name: 'Khám chuyên khoa',
      description: 'Khám các chuyên khoa như tim mạch, tiêu hóa',
      icon: 'heart',
      iconBg: '#E53935',
      hasSubServices: true
    },
    {
      id: 'diagnostic',
      name: 'Chẩn đoán hình ảnh',
      description: 'X-quang, siêu âm, CT, MRI',
      icon: 'scan',
      iconBg: '#43A047',
      hasSubServices: true
    },
    {
      id: 'laboratory',
      name: 'Xét nghiệm',
      description: 'Xét nghiệm máu, nước tiểu, sinh hóa',
      icon: 'flask',
      iconBg: '#FF9800',
      hasSubServices: true
    },
    {
      id: 'vaccination',
      name: 'Tiêm chủng',
      description: 'Tiêm vaccine phòng bệnh cho trẻ em và người lớn',
      icon: 'medical-outline',
      iconBg: '#9C27B0',
      hasSubServices: false
    }
  ];
};

export const getServicesByCategory = (categoryId) => {
  const servicesMap = {
    general: [
      {
        id: 'general-checkup',
        name: 'Khám sức khỏe tổng quát',
        shortDescription: 'Khám toàn diện các chỉ số sức khỏe',
        description: 'Khám sức khỏe tổng quát bao gồm khám lâm sàng và các xét nghiệm cơ bản',
        price: 300000,
        duration: '60 phút',
        icon: 'medical'
      },
      {
        id: 'annual-checkup',
        name: 'Khám sức khỏe định kỳ',
        shortDescription: 'Gói khám sức khỏe hàng năm',
        description: 'Gói khám sức khỏe định kỳ với các xét nghiệm chuyên sâu',
        price: 500000,
        duration: '90 phút',
        icon: 'calendar'
      }
    ],
    specialist: [
      {
        id: 'cardiology',
        name: 'Khám tim mạch',
        shortDescription: 'Khám và điều trị bệnh tim mạch',
        description: 'Khám tim mạch với bác sĩ chuyên khoa, điện tim, siêu âm tim',
        price: 400000,
        duration: '45 phút',
        icon: 'heart'
      },
      {
        id: 'gastro',
        name: 'Khám tiêu hóa',
        shortDescription: 'Khám và điều trị bệnh tiêu hóa',
        description: 'Khám chuyên khoa tiêu hóa, nội soi dạ dày nếu cần',
        price: 350000,
        duration: '30 phút',
        icon: 'nutrition'
      }
    ],
    diagnostic: [
      {
        id: 'xray',
        name: 'Chụp X-quang',
        shortDescription: 'Chụp X-quang các bộ phận',
        description: 'Chụp X-quang phổi, xương khớp, bụng',
        price: 150000,
        duration: '15 phút',
        icon: 'scan'
      },
      {
        id: 'ultrasound',
        name: 'Siêu âm',
        shortDescription: 'Siêu âm bụng, tim, thai',
        description: 'Siêu âm bụng tổng quát, tim, thai nhi',
        price: 200000,
        duration: '20 phút',
        icon: 'radio'
      }
    ],
    laboratory: [
      {
        id: 'blood-test',
        name: 'Xét nghiệm máu',
        shortDescription: 'Xét nghiệm máu tổng quát',
        description: 'Xét nghiệm công thức máu, sinh hóa máu',
        price: 100000,
        duration: '10 phút',
        icon: 'water'
      },
      {
        id: 'urine-test',
        name: 'Xét nghiệm nước tiểu',
        shortDescription: 'Xét nghiệm nước tiểu tổng quát',
        description: 'Xét nghiệm nước tiểu, tế bào, protein',
        price: 50000,
        duration: '5 phút',
        icon: 'flask'
      }
    ]
  };

  return servicesMap[categoryId] || [];
};

export const getServiceById = (serviceId) => {
  const allServices = [];
  const categories = getServiceCategories();
  
  categories.forEach(category => {
    const services = getServicesByCategory(category.id);
    allServices.push(...services);
  });
  
  return allServices.find(service => service.id === serviceId);
};