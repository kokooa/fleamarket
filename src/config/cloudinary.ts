import { v2 as cloudinary, ConfigOptions } from 'cloudinary';

let isConfigured = false;

// Lazy initialization - 실제 사용할 때만 초기화
export const getCloudinary = () => {
    if (!isConfigured) {
        const config: ConfigOptions = {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        };

        // 환경 변수가 있을 때만 설정
        if (config.cloud_name && config.api_key && config.api_secret) {
            cloudinary.config(config);
            isConfigured = true;
            console.log('✅ Cloudinary configured successfully');
        } else {
            console.warn('⚠️  Cloudinary credentials not found - using without config');
        }
    }
    return cloudinary;
};

export default cloudinary;
