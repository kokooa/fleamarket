import { PrismaClient, UserRole, OverallGrade, FunctionalStatus, CosmeticGrade, ProductStatus, DefectSeverity, DefectType } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to get random item from array
const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
// Helper to get random number in range
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Real-ish data for generation
const DEFEKTS = [
    { type: DefectType.SCREEN_CRACK, desc: "화면 모서리에 작은 금이 있습니다.", severity: DefectSeverity.MINOR },
    { type: DefectType.SCREEN_BURN_IN, desc: "약한 잔상이 남아있습니다.", severity: DefectSeverity.MINOR },
    { type: DefectType.BATTERY_DEGRADED, desc: "배터리 효율이 80% 이하입니다.", severity: DefectSeverity.MODERATE },
    { type: DefectType.PHYSICAL_DAMAGE, desc: "생활 기스가 다수 존재합니다.", severity: DefectSeverity.MINOR },     // Mapped SCRATCH to PHYSICAL_DAMAGE
    { type: DefectType.PHYSICAL_DAMAGE, desc: "모서리에 찍힘 자국이 있습니다.", severity: DefectSeverity.MODERATE }, // Mapped DENT to PHYSICAL_DAMAGE
    { type: DefectType.BUTTON_DEFECT, desc: "볼륨 버튼이 뻑뻑합니다.", severity: DefectSeverity.MODERATE },
    { type: DefectType.SPEAKER_DEFECT, desc: "스피커 음량이 약간 작습니다.", severity: DefectSeverity.MINOR },
    { type: DefectType.CAMERA_DEFECT, desc: "카메라 렌즈에 미세한 먼지가 있습니다.", severity: DefectSeverity.MINOR },
    { type: DefectType.OTHER, desc: "박스가 없습니다.", severity: DefectSeverity.MINOR },                            // Mapped NO_BOX to OTHER
    { type: DefectType.OTHER, desc: "충전 케이블이 없습니다.", severity: DefectSeverity.MINOR },                      // Mapped COMPONENT_MISSING to OTHER
];

const CATEGORIES = [
    {
        name: '스마트폰',
        slug: 'smartphones',
        keywords: ['smartphone', 'iphone', 'samsung galaxy', 'pixel phone'],
        models: ['iPhone 13', 'iPhone 14 Pro', 'Galaxy S22', 'Galaxy Z Flip 4', 'Pixel 7', 'iPhone 12 mini', 'Galaxy S21']
    },
    {
        name: '노트북',
        slug: 'laptops',
        keywords: ['laptop', 'macbook', 'gaming laptop', 'surface pro'],
        models: ['MacBook Air M1', 'MacBook Pro 14', 'Dell XPS 13', 'ThinkPad X1', 'LG Gram', 'ASUS ROG Zephyrus', 'Surface Laptop 4']
    },
    {
        name: '오디오',
        slug: 'audio',
        keywords: ['headphones', 'earbuds', 'speaker', 'sony headphones'],
        models: ['Sony WH-1000XM4', 'AirPods Pro', 'Bose QC45', 'Marshall Stanmore', 'JBL Flip 6', 'Galaxy Buds 2 Pro', 'Sony WF-1000XM4']
    },
    {
        name: '게임기',
        slug: 'gaming',
        keywords: ['gaming console', 'ps5', 'xbox', 'nintendo switch'],
        models: ['PlayStation 5', 'Nintendo Switch OLED', 'Xbox Series X', 'Steam Deck', 'Quest 2', 'PlayStation 4 Pro', 'Xbox Series S']
    },
    {
        name: '카메라',
        slug: 'cameras',
        keywords: ['digital camera', 'dslr', 'mirrorless camera', 'film camera'],
        models: ['Sony A7 III', 'Fujifilm X100V', 'Canon EOS R6', 'Leica Q2', 'Instax Mini 11', 'Nikon Z6 II', 'Sony ZV-E10']
    },
    {
        name: '웨어러블',
        slug: 'wearables',
        keywords: ['smartwatch', 'apple watch', 'fitness tracker'],
        models: ['Apple Watch Series 8', 'Galaxy Watch 5', 'Garmin Forerunner', 'Fitbit Charge 5', 'Apple Watch SE', 'Galaxy Watch 4 Classic']
    },
    {
        name: 'TV/모니터',
        slug: 'displays',
        keywords: ['monitor', 'smart tv', 'gaming monitor'],
        models: ['LG OLED TV', 'Samsung Odyssey G7', 'Dell UltraSharp', 'BenQ ScreenBar', 'Samsung Smart Monitor M7', 'LG UltraGear']
    },
    {
        name: 'PC부품',
        slug: 'pc-parts',
        keywords: ['graphics card', 'cpu', 'motherboard', 'ram'],
        models: ['RTX 3070', 'RTX 4090', 'Intel i9-13900K', 'Ryzen 7 5800X', 'Corsair RAM', 'Samsung 980 Pro SSD', 'NZXT Kraken Cooler']
    },
];

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.defectDetail.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productCondition.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.sellerProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const hashedPassword = await bcryptjs.hash('password123', 10);

    const sellers = [];
    for (let i = 1; i <= 2; i++) {
        const seller = await prisma.user.create({
            data: {
                email: `seller${i}@gmail.com`,
                password: hashedPassword,
                name: `판매자${i}`,
                role: UserRole.SELLER,
                emailVerified: true,
                sellerProfile: {
                    create: {
                        shopName: `판매자${i}의 상점`,
                        description: '믿을 수 있는 중고 제품 판매점입니다.',
                    },
                },
            },
        });
        sellers.push(seller);
    }

    const buyer = await prisma.user.create({
        data: {
            email: 'buyer@gmail.com',
            password: hashedPassword,
            name: '구매자1',
            role: UserRole.BUYER,
            emailVerified: true,
        },
    });

    // Create Admin
    await prisma.user.create({
        data: {
            email: 'admin@marketplace.com',
            password: hashedPassword,
            name: '총관리자',
            role: UserRole.ADMIN,
            emailVerified: true,
        },
    });

    console.log('✅ Users created');

    // Create Categories and Products
    for (const catData of CATEGORIES) {
        const category = await prisma.category.create({
            data: {
                name: catData.name,
                slug: catData.slug,
                description: `${catData.name} 관련 제품 모음`,
            },
        });
        console.log(`✅ Category created: ${catData.name}`);

        for (let i = 0; i < 15; i++) {
            const model = random(catData.models);
            const seller = random(sellers);
            const originalPrice = randomInt(100000, 2000000);
            const discountRate = randomInt(10, 60) / 100;
            const sellingPrice = Math.floor(originalPrice * (1 - discountRate));

            // Random defect
            const defectBase = random(DEFEKTS);

            // Determine image keywords based on Category and Brand
            let imageKeyword = random(catData.keywords); // Default fallback
            const brand = model.split(' ')[0].toLowerCase();

            if (catData.slug === 'smartphones') {
                if (brand === 'iphone') imageKeyword = 'iphone';
                else if (brand === 'galaxy' || brand === 'samsung') imageKeyword = 'samsung galaxy phone';
                else if (brand === 'pixel') imageKeyword = 'google pixel phone';
            } else if (catData.slug === 'laptops') {
                if (brand === 'macbook' || brand === 'apple') imageKeyword = 'macbook pro';
                else if (brand === 'dell') imageKeyword = 'dell xps laptop';
                else if (brand === 'thinkpad') imageKeyword = 'lenovo thinkpad';
                else if (brand === 'lg') imageKeyword = 'lg gram';
            } else if (catData.slug === 'audio') {
                if (brand === 'sony') imageKeyword = 'sony headphones';
                else if (brand === 'airpods' || brand === 'apple') imageKeyword = 'airpods pro';
                else if (brand === 'bose') imageKeyword = 'bose headphones';
            } else if (catData.slug === 'gaming') {
                if (brand === 'playstation') imageKeyword = 'ps5 console';
                else if (brand === 'xbox') imageKeyword = 'xbox series x';
                else if (brand === 'nintendo') imageKeyword = 'nintendo switch';
            }

            // Create Product
            await prisma.product.create({
                data: {
                    sellerId: seller.id,
                    categoryId: category.id,
                    name: `${model} (${defectBase.desc.split(' ')[0]})`, // e.g., "iPhone 13 (화면)"
                    description: `이 제품은 ${model}입니다. ${defectBase.desc} 기능상 문제는 없으나 외관상 하자가 있습니다. 저렴하게 가져가세요.`,
                    brand: model.split(' ')[0],
                    model: model,
                    originalPrice: originalPrice,
                    sellingPrice: sellingPrice,
                    status: ProductStatus.ACTIVE,
                    purchaseDate: new Date(Date.now() - randomInt(0, 1000 * 60 * 60 * 24 * 365 * 3)), // up to 3 years ago
                    condition: {
                        create: {
                            overallGrade: OverallGrade.B_GOOD,
                            functionalStatus: FunctionalStatus.FULLY_WORKING,
                            cosmeticGrade: CosmeticGrade.FAIR,
                            screenDefect: defectBase.type === DefectType.SCREEN_CRACK || defectBase.type === DefectType.SCREEN_BURN_IN,
                            cameraDefect: defectBase.type === DefectType.CAMERA_DEFECT,
                            speakerDefect: defectBase.type === DefectType.SPEAKER_DEFECT,
                            buttonDefect: defectBase.type === DefectType.BUTTON_DEFECT,
                            additionalNotes: defectBase.desc,
                        }
                    },
                    defects: {
                        create: [{
                            defectType: defectBase.type,
                            severity: defectBase.severity,
                            description: defectBase.desc
                        }]
                    },
                    images: {
                        create: [
                            {
                                // LoremFlickr for reliable keyword-based images
                                // Format: https://loremflickr.com/width/height/keyword
                                url: `https://loremflickr.com/800/600/${encodeURIComponent(imageKeyword)}?lock=${randomInt(1, 10000)}`,
                                imageType: 'MAIN',
                                order: 1
                            },
                            {
                                url: `https://loremflickr.com/800/600/defect,broken?lock=${randomInt(10001, 20000)}`,
                                imageType: 'DEFECT',
                                order: 2
                            }
                        ]
                    }
                }
            });
        }
    }

    console.log('✅ 120 Products created (15 per category)');
    console.log('🎉 Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
