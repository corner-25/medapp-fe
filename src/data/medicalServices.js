// src/data/medicalServices.js - Medical Services Data
export const medicalServicesCategories = [
  {
    id: 'basic',
    name: 'Gói cơ bản',
    description: 'Gói khám sức khỏe tổng quát cơ bản, phù hợp cho khám định kỳ',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#66BB6A'],
    highlight: true
  },
  {
    id: 'standard',
    name: 'Gói tiêu chuẩn',
    description: 'Gói khám sức khỏe toàn diện hơn với nhiều xét nghiệm bổ sung',
    color: '#2196F3',
    gradient: ['#2196F3', '#42A5F5'],
    highlight: true
  },
  {
    id: 'advanced',
    name: 'Gói nâng cao',
    description: 'Gói khám chuyên sâu theo giới tính với đầy đủ xét nghiệm',
    color: '#FF9800',
    gradient: ['#FF9800', '#FFB74D'],
    highlight: true
  },
  {
    id: 'cancer',
    name: 'Tầm soát ung thư',
    description: 'Gói tầm soát ung thư sớm theo giới tính',
    color: '#F44336',
    gradient: ['#F44336', '#EF5350']
  },
  {
    id: 'gynecology',
    name: 'Phụ khoa',
    description: 'Gói khám phụ khoa và sức khỏe sinh sản',
    color: '#E91E63',
    gradient: ['#E91E63', '#F06292']
  },
  {
    id: 'symptom',
    name: 'Theo triệu chứng',
    description: 'Gói khám chuyên biệt theo từng triệu chứng cụ thể',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#BA68C8']
  },
  {
    id: 'specialty',
    name: 'Chuyên khoa',
    description: 'Gói khám chuyên khoa sâu cho các bệnh lý đặc biệt',
    color: '#607D8B',
    gradient: ['#607D8B', '#78909C']
  }
];

export const medicalServicesData = [
  // GÓI CƠ BẢN
  {
    serviceId: 1,
    name: "Gói TQ cơ bản",
    price: 875000,
    description: "Gói khám sức khỏe tổng quát cơ bản bao gồm: Xét nghiệm máu toàn phần để kiểm tra tình trạng thiếu máu, nhiễm trùng và các bệnh lý máu; Xét nghiệm nước tiểu tổng quát phát hiện bệnh lý thận, tiết niệu; Các xét nghiệm sinh hóa cơ bản (đường huyết, mỡ máu, chức năng gan thận); Điện tim 12 chuyển đạo để phát hiện bất thường nhịp tim và bệnh lý tim mạch; X-quang phổi phát hiện bệnh lý phổi, lao phổi; Đo huyết áp và các chỉ số sinh hiệu cơ bản.",
    category: "basic",
    duration: 120,
    preparationInstructions: "Nhịn ăn 8-12 tiếng trước khi xét nghiệm. Uống nước lọc bình thường.",
    targetAudience: ["all"],
    includedTests: ["Xét nghiệm máu toàn phần", "Xét nghiệm nước tiểu", "Sinh hóa cơ bản", "Điện tim", "X-quang phổi"],
    tags: ["tổng quát", "cơ bản", "sức khỏe", "định kỳ", "tim mạch", "huyết áp"],
    image: "https://via.placeholder.com/300x200/4CAF50/white?text=🏥+Gói+Cơ+Bản",
    icon: "heart-outline",
    iconColor: "#4CAF50",
    gradient: ["#4CAF50", "#66BB6A"]
  },

  // GÓI TIÊU CHUẨN
  {
    serviceId: 2,
    name: "Gói TQ tiêu chuẩn",
    price: 2119000,
    description: "Gói khám sức khỏe tổng quát tiêu chuẩn bao gồm tất cả các xét nghiệm trong gói cơ bản PLUS: Xét nghiệm sinh hóa mở rộng (protein, albumin, bilirubin, enzyme gan); Xét nghiệm lipid profile đầy đủ (cholesterol, triglyceride, HDL, LDL); Xét nghiệm chức năng thận mở rộng (ure, creatinin, acid uric); Siêu âm ổ bụng tổng quát để kiểm tra gan, thận, túi mật, tụy; Đo loãng xương phát hiện nguy cơ gãy xương; Xét nghiệm hormone tuyến giáp cơ bản.",
    category: "standard",
    duration: 180,
    preparationInstructions: "Nhịn ăn 10-12 tiếng trước khi xét nghiệm. Không uống rượu bia 24h trước khám.",
    targetAudience: ["all"],
    includedTests: ["Tất cả xét nghiệm gói cơ bản", "Sinh hóa mở rộng", "Lipid profile", "Siêu âm ổ bụng", "Đo loãng xương", "Hormone tuyến giáp"],
    tags: ["tổng quát", "tiêu chuẩn", "toàn diện", "gan", "thận", "tuyến giáp", "loãng xương"],
    image: "https://via.placeholder.com/300x200/2196F3/white?text=⭐+Gói+Tiêu+Chuẩn",
    icon: "shield-checkmark-outline",
    iconColor: "#2196F3",
    gradient: ["#2196F3", "#42A5F5"]
  },

  // GÓI NÂNG CAO
  {
    serviceId: 3,
    name: "Gói TQ nâng cao (nữ)",
    price: 4029000,
    description: "Gói khám sức khỏe tổng quát nâng cao dành riêng cho phụ nữ bao gồm tất cả các xét nghiệm trong gói tiêu chuẩn PLUS: Xét nghiệm hormone sinh dục nữ (FSH, LH, Estrogen, Progesterone); Xét nghiệm tầm soát ung thư cổ tử cung (Pap smear); Siêu âm vú và siêu âm phụ khoa qua âm đạo; Xét nghiệm CA 125 (dấu ấn ung thư buồng trứng); Xét nghiệm CA 15-3 (dấu ấn ung thư vú); Xét nghiệm vitamin D và các vi chất cần thiết; Đo mật độ xương chi tiết; Siêu âm tuyến giáp.",
    category: "advanced",
    duration: 240,
    preparationInstructions: "Nhịn ăn 12 tiếng trước xét nghiệm. Không quan hệ tình dục 24h trước siêu âm phụ khoa. Khám tốt nhất vào ngày 5-10 của chu kỳ kinh.",
    targetAudience: ["female"],
    includedTests: ["Tất cả xét nghiệm gói tiêu chuẩn", "Hormone sinh dục nữ", "Pap smear", "Siêu âm vú", "Siêu âm phụ khoa", "CA 125", "CA 15-3", "Vitamin D"],
    tags: ["nữ", "nâng cao", "phụ khoa", "ung thư vú", "ung thư cổ tử cung", "hormone", "sinh sản"],
    image: "https://via.placeholder.com/300x200/FF9800/white?text=👩‍⚕️+Gói+Nữ",
    icon: "flower-outline",
    iconColor: "#FF9800",
    gradient: ["#FF9800", "#FFB74D"]
  },
  {
    serviceId: 4,
    name: "Gói TQ nâng cao (nam)",
    price: 3379000,
    description: "Gói khám sức khỏe tổng quát nâng cao dành riêng cho nam giới bao gồm tất cả các xét nghiệm trong gói tiêu chuẩn PLUS: Xét nghiệm hormone nam giới (Testosterone, FSH, LH); Xét nghiệm PSA (dấu ấn ung thư tuyến tiền liệt); Siêu âm tuyến tiền liệt qua trực tràng; Xét nghiệm chức năng gan mở rộng do nam giới hay sử dụng rượu bia; Test gắng sức tim mạch; Xét nghiệm các dấu ấn ung thư phổ biến ở nam (CEA, AFP); Đánh giá nguy cơ tim mạch chi tiết; Siêu âm động mạch cảnh.",
    category: "advanced",
    duration: 240,
    preparationInstructions: "Nhịn ăn 12 tiếng trước xét nghiệm. Không quan hệ tình dục 48h trước xét nghiệm PSA. Mặc quần áo thoải mái cho test gắng sức.",
    targetAudience: ["male"],
    includedTests: ["Tất cả xét nghiệm gói tiêu chuẩn", "Hormone nam", "PSA", "Siêu âm tiền liệt tuyến", "Test gắng sức", "CEA", "AFP", "Siêu âm động mạch cảnh"],
    tags: ["nam", "nâng cao", "tiền liệt tuyến", "testosterone", "tim mạch", "ung thư", "nam khoa"],
    image: "https://via.placeholder.com/300x200/607D8B/white?text=👨‍⚕️+Gói+Nam",
    icon: "man-outline",
    iconColor: "#607D8B",
    gradient: ["#607D8B", "#78909C"]
  },

  // GÓI TẦMSOÁT UNG THƯ
  {
    serviceId: 5,
    name: "Gói Ung thư (nữ)",
    price: 1300000,
    description: "Gói tầm soát ung thư chuyên sâu dành cho phụ nữ bao gồm: Xét nghiệm tầm soát ung thư cổ tử cung (Pap test + HPV test); Chụp X-quang tuyến vú (Mammography) phát hiện ung thư vú sớm; Xét nghiệm các dấu ấn ung thư CA 125 (buồng trứng), CA 15-3 (vú), CA 19-9 (dạ dày, tụy); Siêu âm vú và siêu âm phụ khoa chi tiết; Nội soi cổ tử cung (Colposcopy) nếu có bất thường; Tư vấn di truyền ung thư nếu có tiền sử gia đình.",
    category: "cancer",
    duration: 180,
    preparationInstructions: "Không quan hệ tình dục, thụt rửa âm đạo 24h trước khám. Khám sau kỳ kinh 3-7 ngày. Mang theo kết quả khám gần nhất nếu có.",
    targetAudience: ["female"],
    includedTests: ["Pap test", "HPV test", "Mammography", "CA 125", "CA 15-3", "CA 19-9", "Siêu âm vú", "Siêu âm phụ khoa", "Colposcopy"],
    tags: ["ung thư", "nữ", "tầm soát", "vú", "cổ tử cung", "buồng trứng", "mammography", "pap smear"],
    image: "https://via.placeholder.com/300x200/E91E63/white?text=🎗️+Ung+Thư+Nữ",
    icon: "ribbon-outline",
    iconColor: "#E91E63",
    gradient: ["#E91E63", "#F06292"]
  },
  {
    serviceId: 6,
    name: "Gói Ung thư (nam)",
    price: 1230000,
    description: "Gói tầm soát ung thư chuyên sâu dành cho nam giới bao gồm: Xét nghiệm PSA total và PSA free để phát hiện ung thư tuyến tiền liệt; Nội soi dạ dày phát hiện ung thư dạ dày và Helicobacter pylori; Chụp CT phổi liều thấp phát hiện ung thư phổi sớm; Xét nghiệm các dấu ấn ung thư CEA (đại trực tràng), AFP (gan), CA 19-9 (tụy); Siêu âm ổ bụng tổng quát tìm khối u; Xét nghiệm máu tìm tế bào ung thư lưu hành (CTC).",
    category: "cancer",
    duration: 240,
    preparationInstructions: "Nhịn ăn 8 tiếng trước nội soi dạ dày. Không quan hệ tình dục 48h trước xét nghiệm PSA. Tắm sạch sẽ trước CT.",
    targetAudience: ["male"],
    includedTests: ["PSA total & free", "Nội soi dạ dày", "CT phổi", "CEA", "AFP", "CA 19-9", "Siêu âm ổ bụng", "CTC"],
    tags: ["ung thư", "nam", "tầm soát", "tiền liệt tuyến", "phổi", "gan", "dạ dày", "đại trực tràng"],
    image: "https://via.placeholder.com/300x200/F44336/white?text=🔬+Ung+Thư+Nam",
    icon: "search-outline",
    iconColor: "#F44336",
    gradient: ["#F44336", "#EF5350"]
  },

  // GÓI PHỤ KHOA
  {
    serviceId: 7,
    name: "Gói Phụ khoa cơ bản",
    price: 1150000,
    description: "Gói khám phụ khoa cơ bản bao gồm: Khám phụ khoa tổng quát bởi bác sĩ chuyên khoa; Siêu âm phụ khoa qua bụng và qua âm đạo để kiểm tra tử cung, buồng trứng; Xét nghiệm dịch âm đạo tìm nấm, vi khuẩn, trichomonas; Xét nghiệm Pap smear tầm soát ung thư cổ tử cung; Siêu âm vú kiểm tra khối u, nang vú; Xét nghiệm hormone nữ cơ bản (FSH, LH); Xét nghiệm nhiễm trùng đường sinh dục (Chlamydia, Gonorrhea).",
    category: "gynecology",
    duration: 120,
    preparationInstructions: "Không quan hệ tình dục 24h trước khám. Vệ sinh sạch sẽ. Khám sau kỳ kinh 3-5 ngày.",
    targetAudience: ["female"],
    includedTests: ["Khám phụ khoa", "Siêu âm phụ khoa", "Xét nghiệm dịch âm đạo", "Pap smear", "Siêu âm vú", "Hormone nữ", "STD test"],
    tags: ["phụ khoa", "nữ", "cơ bản", "tử cung", "buồng trứng", "vú", "âm đạo", "hormone"],
    image: "https://via.placeholder.com/300x200/9C27B0/white?text=🌸+Phụ+Khoa",
    icon: "flower",
    iconColor: "#9C27B0",
    gradient: ["#9C27B0", "#BA68C8"]
  },
  {
    serviceId: 8,
    name: "Gói Phụ khoa nâng cao",
    price: 1642000,
    description: "Gói khám phụ khoa nâng cao cho tiền hôn nhân và chuẩn bị mang thai bao gồm tất cả xét nghiệm trong gói cơ bản PLUS: Xét nghiệm TORCH (Toxoplasma, Rubella, CMV, Herpes) gây dị tật thai nhi; Xét nghiệm kháng thể Hepatitis B, C, HIV, Syphilis; Xét nghiệm AMH đánh giá dự trữ buồng trứng; Xét nghiệm hormone sinh dục đầy đủ đánh giá khả năng sinh sản; Xét nghiệm di truyền thalassemia phòng bệnh di truyền; Tư vấn dinh dưỡng và vitamin cần thiết khi mang thai; Siêu âm 4D đánh giá chi tiết cơ quan sinh dục.",
    category: "gynecology",
    duration: 240,
    preparationInstructions: "Nhịn ăn 8 tiếng cho xét nghiệm máu. Không quan hệ tình dục 24h trước khám. Mang theo tiền sử bệnh lý gia đình.",
    targetAudience: ["female"],
    includedTests: ["Tất cả gói phụ khoa cơ bản", "TORCH", "Hepatitis B,C", "HIV", "Syphilis", "AMH", "Hormone sinh dục", "Di truyền", "Siêu âm 4D"],
    tags: ["phụ khoa", "nâng cao", "tiền hôn nhân", "mang thai", "sinh sản", "TORCH", "AMH", "di truyền"],
    image: "https://via.placeholder.com/300x200/673AB7/white?text=💒+Tiền+Hôn+Nhân",
    icon: "heart",
    iconColor: "#673AB7",
    gradient: ["#673AB7", "#9575CD"]
  },

  // GÓI THEO TRIỆU CHỨNG
  {
    serviceId: 10,
    name: "Gói ngứa",
    price: 474000,
    description: "Gói xét nghiệm chuyên sâu cho triệu chứng ngứa bao gồm: Xét nghiệm dị ứng toàn diện (IgE tổng số và các allergen phổ biến); Xét nghiệm chức năng gan (ALT, AST, Bilirubin) vì ngứa có thể do bệnh gan; Xét nghiệm chức năng thận phát hiện bệnh thận gây ngứa; Xét nghiệm tìm ký sinh trùng trong máu và phân; Test da với các chất gây dị ứng thường gặp (bụi nhà, phấn hoa, thức ăn); Xét nghiệm vitamin B12, folate thiếu hụt gây ngứa; Xét nghiệm thyroid vì rối loạn tuyến giáp có thể gây ngứa toàn thân.",
    category: "symptom",
    duration: 90,
    preparationInstructions: "Ngưng thuốc kháng histamine 3 ngày trước test da. Nhịn ăn 6 tiếng cho xét nghiệm máu.",
    targetAudience: ["all"],
    includedTests: ["Dị ứng IgE", "Chức năng gan", "Chức năng thận", "Ký sinh trùng", "Test da", "Vitamin B12", "Thyroid"],
    tags: ["ngứa", "triệu chứng", "dị ứng", "gan", "thận", "thyroid", "vitamin", "da"],
    image: "https://via.placeholder.com/300x200/FF5722/white?text=🤲+Gói+Ngứa",
    icon: "hand-left-outline",
    iconColor: "#FF5722",
    gradient: ["#FF5722", "#FF7043"]
  },
  {
    serviceId: 11,
    name: "Gói đau bụng",
    price: 730000,
    description: "Gói xét nghiệm chuyên sâu cho triệu chứng đau bụng bao gồm: Siêu âm ổ bụng tổng quát kiểm tra gan, thận, túi mật, tụy, lách; Xét nghiệm enzyme tụy (Amylase, Lipase) phát hiện viêm tụy; Xét nghiệm chức năng gan đầy đủ phát hiện viêm gan, sỏi mật; Xét nghiệm máu tìm dấu hiệu nhiễm trùng (CRP, PCT); Xét nghiệm ký sinh trùng đường ruột; Test Helicobacter pylori gây loét dạ dày; Xét nghiệm CEA, CA 19-9 tầm soát ung thư đường tiêu hóa nếu cần; Phân tích nước tiểu tìm sỏi thận.",
    category: "symptom",
    duration: 120,
    preparationInstructions: "Nhịn ăn 8 tiếng trước siêu âm. Thu thập mẫu phân sáng sớm. Không dùng thuốc đau bụng trước khám.",
    targetAudience: ["all"],
    includedTests: ["Siêu âm ổ bụng", "Enzyme tụy", "Chức năng gan", "CRP, PCT", "Ký sinh trùng ruột", "H.pylori", "CEA, CA19-9", "Nước tiểu"],
    tags: ["đau bụng", "triệu chứng", "tụy", "gan", "ruột", "dạ dày", "sỏi mật", "nhiễm trùng"],
    image: "https://via.placeholder.com/300x200/795548/white?text=🫃+Đau+Bụng",
    icon: "body-outline",
    iconColor: "#795548",
    gradient: ["#795548", "#A1887F"]
  },
  {
    serviceId: 12,
    name: "Gói đau ngực",
    price: 875000,
    description: "Gói xét nghiệm chuyên sâu cho triệu chứng đau ngực bao gồm: Điện tim 12 chuyển đạo và điện tim gắng sức phát hiện bệnh mạch vành; Xét nghiệm Troponin I, CK-MB chẩn đoán nhồi máu cơ tim; Siêu âm tim đánh giá chức năng tim, van tim; Chụp X-quang ngực phát hiện bệnh lý phổi, màng phổi; Xét nghiệm D-dimer phát hiện huyết khối phổi; Xét nghiệm lipid profile đánh giá nguy cơ tim mạch; CT Angio mạch vành nếu có chỉ định; Holter điện tim 24h theo dõi rối loạn nhịp.",
    category: "symptom",
    duration: 180,
    preparationInstructions: "Mặc quần áo thoải mái cho điện tim. Nhịn ăn 6 tiếng cho xét nghiệm máu. Mang theo thuốc tim đang dùng nếu có.",
    targetAudience: ["all"],
    includedTests: ["Điện tim", "Test gắng sức", "Troponin I", "CK-MB", "Siêu âm tim", "X-quang ngực", "D-dimer", "Lipid profile", "Holter"],
    tags: ["đau ngực", "triệu chứng", "tim mạch", "mạch vành", "nhồi máu", "phổi", "điện tim", "troponin"],
    image: "https://via.placeholder.com/300x200/E53935/white?text=💓+Đau+Ngực",
    icon: "heart-half-outline",
    iconColor: "#E53935",
    gradient: ["#E53935", "#EF5350"]
  },

  // GÓI CHUYÊN KHOA
  {
    serviceId: 13,
    name: "Gói đột quỵ",
    price: 2826000,
    description: "Gói kiểm tra nguy cơ đột quỵ toàn diện bao gồm: Chụp CT não không thuốc tương phản tìm xuất huyết não; Chụp MRI não với thuốc đối quang phát hiện nhồi máu não sớm; Siêu âm Doppler động mạch cảnh đánh giá hẹp mạch máu não; Siêu âm tim tìm nguồn tắc mạch từ tim; Xét nghiệm đông máu đầy đủ (PT, APTT, INR, Fibrinogen); Xét nghiệm lipid profile và HbA1c đánh giá yếu tố nguy cơ; Điện tim và Holter 24h tìm rung nhĩ; Test đánh giá nhận thức và vận động.",
    category: "specialty",
    duration: 300,
    preparationInstructions: "Nhịn ăn 6 tiếng cho xét nghiệm máu. Tháo đồ trang sức trước chụp CT/MRI. Mang theo danh sách thuốc đang dùng.",
    targetAudience: ["adult", "elderly"],
    includedTests: ["CT não", "MRI não", "Siêu âm Doppler cảnh", "Siêu âm tim", "Đông máu", "Lipid profile", "HbA1c", "Điện tim", "Holter", "Test nhận thức"],
    tags: ["đột quỵ", "não", "mạch máu não", "tim mạch", "huyết áp", "tiểu đường", "CT", "MRI", "nguy cơ cao"],
    image: "https://via.placeholder.com/300x200/3F51B5/white?text=🧠+Đột+Quỵ",
    icon: "scan-outline",
    iconColor: "#3F51B5",
    gradient: ["#3F51B5", "#5C6BC0"]
  },
  {
    serviceId: 14,
    name: "Gói giun sán",
    price: 712000,
    description: "Gói xét nghiệm tầm soát giun sán và ký sinh trùng toàn diện bao gồm: Xét nghiệm phân tìm trứng giun đũa, giun móc, giun đường ruột; Xét nghiệm máu tìm ấu trùng giun chỉ, sán lá; Test nhanh phát hiện giun kremi (Enterobius); Xét nghiệm kháng thể IgG, IgM với các loại sán (sán lá gan, sán máu); Siêu âm gan tìm nang sán, áp xe do sán; Nội soi đại tràng nếu nghi ngờ giun sán đường ruột lớn; Xét nghiệm vi sinh phân tìm vi khuẩn gây tiêu chảy đi kèm.",
    category: "specialty",
    duration: 120,
    preparationInstructions: "Thu thập mẫu phân 3 ngày liên tiếp, mẫu sáng sớm. Nhịn ăn 8 tiếng cho nội soi nếu có chỉ định.",
    targetAudience: ["all"],
    includedTests: ["Xét nghiệm phân", "Xét nghiệm máu ký sinh trùng", "Test giun kremi", "Kháng thể sán", "Siêu âm gan", "Nội soi đại tràng", "Vi sinh phân"],
    tags: ["giun sán", "ký sinh trùng", "đau bụng", "tiêu chảy", "sút cân", "gan", "ruột", "nhiễm trùng"],
    image: "https://via.placeholder.com/300x200/8BC34A/white?text=🔬+Giun+Sán",
    icon: "bug-outline",
    iconColor: "#8BC34A",
    gradient: ["#8BC34A", "#AED581"]
  }
];

// Helper functions
export const getServicesByCategory = (category) => {
  return medicalServicesData.filter(service => service.category === category);
};

export const getServiceById = (serviceId) => {
  return medicalServicesData.find(service => service.serviceId === serviceId);
};

export const searchServices = (query) => {
  const lowerQuery = query.toLowerCase();
  return medicalServicesData.filter(service =>
    service.name.toLowerCase().includes(lowerQuery) ||
    service.description.toLowerCase().includes(lowerQuery) ||
    service.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getServicesByTargetAudience = (audience) => {
  return medicalServicesData.filter(service =>
    service.targetAudience.includes(audience) || service.targetAudience.includes('all')
  );
};

export const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default {
  medicalServicesCategories,
  medicalServicesData,
  getServicesByCategory,
  getServiceById,
  searchServices,
  getServicesByTargetAudience,
  formatPrice
};