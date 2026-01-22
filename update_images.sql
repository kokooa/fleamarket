-- 데이터베이스의 이미지 URL을 placehold.co로 업데이트
-- placehold.co는 빠르고 안정적인 placeholder 서비스입니다

UPDATE "ProductImage" 
SET url = REPLACE(url, 'https://via.placeholder.com/800x600?text=', 'https://placehold.co/800x600/indigo/white?text=')
WHERE url LIKE '%via.placeholder.com%';
