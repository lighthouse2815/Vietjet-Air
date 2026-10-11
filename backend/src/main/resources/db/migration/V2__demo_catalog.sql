INSERT INTO airports(code,city,name,country) VALUES
('HAN','Hà Nội','Nội Bài','Việt Nam'),('SGN','TP. Hồ Chí Minh','Tân Sơn Nhất','Việt Nam'),('DAD','Đà Nẵng','Đà Nẵng','Việt Nam'),('PQC','Phú Quốc','Phú Quốc','Việt Nam'),('CXR','Nha Trang','Cam Ranh','Việt Nam'),('DLI','Đà Lạt','Liên Khương','Việt Nam'),('VII','Vinh','Vinh','Việt Nam'),('VDH','Quảng Bình','Đồng Hới','Việt Nam'),('PXU','Gia Lai','Pleiku','Việt Nam');
INSERT INTO fare_classes(code,name,benefits,baggage_kg,seat_included) VALUES
('ECO','Eco','7 kg hành lý xách tay · Đổi vé có phí demo',0,FALSE),
('DELUXE','Deluxe','7 kg xách tay · 20 kg ký gửi · Chọn ghế tiêu chuẩn',20,TRUE),
('SKYBOSS','SkyBoss','10 kg xách tay · 30 kg ký gửi · Ưu tiên thủ tục · Suất ăn',30,TRUE),
('BUSINESS','Business','18 kg xách tay · 40 kg ký gửi · Phòng chờ · Dịch vụ cao cấp demo',40,TRUE);
INSERT INTO ancillary_services(code,name,category,description,price) VALUES
('BAG20','Hành lý ký gửi 20 kg','BAGGAGE','Gói mua thêm cho mỗi hành khách, mỗi chặng',200000),
('BAG30','Hành lý ký gửi 30 kg','BAGGAGE','Gói mua thêm cho mỗi hành khách, mỗi chặng',300000),
('MEAL_RICE','Cơm gà nấm','MEAL','Suất ăn nóng demo',85000),('MEAL_VEG','Suất ăn chay','MEAL','Cơm rau củ và nước uống demo',75000),
('PRIORITY','Ưu tiên làm thủ tục','PRIORITY','Quầy ưu tiên trong trải nghiệm mô phỏng',100000),
('INSURANCE','Bảo hiểm chuyến bay demo','INSURANCE','Chỉ là mô phỏng, không có hợp đồng bảo hiểm thực',45000);
INSERT INTO promotion_codes(code,percent,max_discount,expires_on) VALUES ('DEMO10',10,200000,CURRENT_DATE+3650);
INSERT INTO content_items(category,title,description,image,target,sort_order) VALUES
('HERO','MỞ KẾT NỐI BẦU TRỜI','Bay đến những điều tuyệt vời · Trải nghiệm đặt vé độc lập','/assets/hero-bay.webp','/',1),
('HERO','BAY VUI, KHÁM PHÁ MỚI','Khởi hành cùng những hành trình đáng nhớ','/assets/hero-bay.webp','/services/promotions',2),
('HERO','SĂN VÉ DEMO MỖI NGÀY','Nhập DEMO10 · Giảm 10%, tối đa 200.000 đ','/assets/hero-bay.webp','/services/promotions',3),
('FEATURE','Tận hưởng chuyến bay','Thêm tiện ích, thêm niềm vui trên mỗi hành trình','/assets/cabin.webp','/services/skyjoy',1),
('SERVICE','Bảo hiểm','An tâm trọn vẹn trên mỗi hành trình. Dịch vụ bảo hiểm trong bản demo không tạo hợp đồng thực.','/assets/family.webp','/services/insurance',1),
('SERVICE','Gửi hàng nhanh','Vận chuyển Bắc – Trung – Nam siêu tốc, siêu tiện lợi. Dịch vụ được giới thiệu, chưa tích hợp vận chuyển.','/assets/cargo.webp','/services/cargo',2),
('SERVICE','Bay cùng thẻ HDBank Vietjet','Khám phá tiện ích thanh toán. Bản demo chỉ hỗ trợ thanh toán giả lập.','/assets/cabin.webp','/services/banking',3),
('SHOP','Mua sắm, giải trí trên mây','Yêu hàng hiệu, vui mỗi chuyến đi · Khám phá dịch vụ trên chuyến bay','/assets/shopping.webp','/services/skyshop',1),
('TRAVEL','Khách sạn','Nghỉ dưỡng và tận hưởng những điểm đến mới','/assets/resort.webp','/services/hotels',1),
('TRAVEL','Du lịch trọn gói','Những hành trình cùng người bạn yêu thương','/assets/japan.webp','/services/holidays',2),
('TRAVEL','Săn vé giá rẻ','Tìm chuyến bay phù hợp với lịch trình của bạn','/assets/hero-bay.webp','/flights',3),
('DESTINATION','Quảng Bình','VDH','/assets/quang-binh.webp','VDH',1),('DESTINATION','Gia Lai','PXU','/assets/gia-lai.webp','PXU',2),('DESTINATION','Nghệ An','VII','/assets/nghe-an.webp','VII',3),('DESTINATION','Hà Nội','HAN','/assets/ha-noi.webp','HAN',4),('DESTINATION','Thành phố Hồ Chí Minh','SGN','/assets/ho-chi-minh.webp','SGN',5),('DESTINATION','Phú Quốc','PQC','/assets/phu-quoc.webp','PQC',6),
('FAQ','Đặt vé trực tuyến','Chọn hành trình, hạng vé, nhập thông tin mẫu và thanh toán demo. Giá được tính lại ở backend.','','booking',1),
('FAQ','Chỗ ngồi','Ghế còn trống hiển thị trên sơ đồ. Ghế được giữ khi tạo booking, có thể hết nếu người khác đặt trước.','','seats',2),
('FAQ','Hành lý','Gói hành lý và quyền lợi hạng vé là dữ liệu demo, không phải quy định của hãng.','','baggage',3),
('FAQ','Check-in','Demo mở check-in 30 ngày và đóng 1 giờ trước khởi hành. Chỉ booking đã thanh toán được check-in.','','check-in',4),
('FAQ','Nối chuyến','Demo hỗ trợ một chiều và khứ hồi; chưa hỗ trợ nhiều chặng hoặc nối chuyến.','','connections',5),
('FAQ','Suất ăn','Chọn suất ăn cho từng hành khách và chặng bay tại bước dịch vụ bổ sung.','','meals',6);
