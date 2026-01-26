import { PrismaClient, UserRole, OverallGrade, FunctionalStatus, CosmeticGrade } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data (optional - for development)
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.defectDetail.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productCondition.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.sellerProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const hashedPassword = await bcryptjs.hash('password123', 10);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@marketplace.com',
            password: hashedPassword,
            name: 'Admin User',
            role: UserRole.ADMIN,
            emailVerified: true,
        },
    });

    const seller1 = await prisma.user.create({
        data: {
            email: 'seller1@gmail.com',
            password: hashedPassword,
            name: '김철수',
            role: UserRole.SELLER,
            phone: '010-1234-5678',
            emailVerified: true,
            sellerProfile: {
                create: {
                    shopName: '철수의 중고전자',
                    description: '정직한 거래를 약속합니다.',
                },
            },
        },
    });

    const seller2 = await prisma.user.create({
        data: {
            email: 'seller2@gmail.com',
            password: hashedPassword,
            name: '이영희',
            role: UserRole.SELLER,
            phone: '010-9876-5432',
            emailVerified: true,
            sellerProfile: {
                create: {
                    shopName: '영희의 부품샵',
                    description: '수리용 부품 전문',
                },
            },
        },
    });

    const buyer1 = await prisma.user.create({
        data: {
            email: 'buyer@gmail.com',
            password: hashedPassword,
            name: '박민수',
            role: UserRole.BUYER,
            emailVerified: true,
        },
    });

    console.log('✅ Users created');

    // Create categories
    const smartphoneCategory = await prisma.category.create({
        data: {
            name: '스마트폰',
            slug: 'smartphones',
            description: '스마트폰 및 휴대폰',
            order: 1,
        },
    });

    const iphoneCategory = await prisma.category.create({
        data: {
            name: 'iPhone',
            slug: 'iphone',
            description: 'Apple iPhone',
            parentId: smartphoneCategory.id,
            order: 1,
        },
    });

    const galaxyCategory = await prisma.category.create({
        data: {
            name: 'Galaxy',
            slug: 'galaxy',
            description: 'Samsung Galaxy',
            parentId: smartphoneCategory.id,
            order: 2,
        },
    });

    const laptopCategory = await prisma.category.create({
        data: {
            name: '노트북',
            slug: 'laptops',
            description: '노트북 컴퓨터',
            order: 2,
        },
    });

    const macbookCategory = await prisma.category.create({
        data: {
            name: 'MacBook',
            slug: 'macbook',
            description: 'Apple MacBook',
            parentId: laptopCategory.id,
            order: 1,
        },
    });

    const tabletCategory = await prisma.category.create({
        data: {
            name: '태블릿',
            slug: 'tablets',
            description: '태블릿 PC',
            order: 3,
        },
    });

    const headphoneCategory = await prisma.category.create({
        data: {
            name: '헤드폰/이어폰',
            slug: 'headphones',
            description: '오디오 기기',
            order: 4,
        },
    });

    console.log('✅ Categories created');

    // Create sample products
    const _product1 = await prisma.product.create({
        data: {
            sellerId: seller1.id,
            categoryId: iphoneCategory.id,
            name: 'iPhone 13 Pro 128GB 그라파이트',
            description: '화면 깨짐 있지만 정상 작동합니다. 배터리 건강도 85%입니다.',
            brand: 'Apple',
            model: 'iPhone 13 Pro',
            serialNumber: 'C39XXXXXXX',
            originalPrice: 1200000,
            sellingPrice: 450000,
            status: 'ACTIVE',
            purchaseDate: new Date('2021-10-15'),
            warrantyMonths: 12,
            isForParts: false,
            isRepairable: true,
            repairNotes: '화면 교체 시 정상 사용 가능. 예상 수리비 약 20만원',
            condition: {
                create: {
                    overallGrade: OverallGrade.C_FAIR,
                    functionalStatus: FunctionalStatus.FULLY_WORKING,
                    cosmeticGrade: CosmeticGrade.FAIR,
                    batteryHealth: 85,
                    screenDefect: true,
                    cameraDefect: false,
                    speakerDefect: false,
                    portDefect: false,
                    buttonDefect: false,
                    additionalNotes: '앞면 화면 우측 상단 균열, 그 외 정상',
                },
            },
            defects: {
                create: [
                    {
                        defectType: 'SCREEN_CRACK',
                        severity: 'MODERATE',
                        description: '화면 우측 상단 3cm 균열, 터치는 정상 작동',
                    },
                    {
                        defectType: 'BATTERY_DEGRADED',
                        severity: 'MINOR',
                        description: '배터리 건강도 85%, 하루 사용 가능',
                    },
                ],
            },
            images: {
                create: [
                    {
                        url: 'https://via.placeholder.com/800x600?text=iPhone+13+Pro+Main',
                        imageType: 'MAIN',
                        order: 1,
                    },
                    {
                        url: 'https://via.placeholder.com/800x600?text=Screen+Crack',
                        imageType: 'DEFECT',
                        order: 2,
                    },
                ],
            },
        },
    });

    const _product2 = await prisma.product.create({
        data: {
            sellerId: seller2.id,
            categoryId: galaxyCategory.id,
            name: 'Galaxy S21 Ultra 256GB (부품용)',
            description: '메인보드 고장으로 켜지지 않습니다. 부품 추출용으로 판매합니다.',
            brand: 'Samsung',
            model: 'Galaxy S21 Ultra',
            originalPrice: 1400000,
            sellingPrice: 180000,
            status: 'ACTIVE',
            isForParts: true,
            isRepairable: false,
            repairNotes: '메인보드 교체 필요, 경제성 없음',
            condition: {
                create: {
                    overallGrade: OverallGrade.F_FOR_PARTS,
                    functionalStatus: FunctionalStatus.NOT_WORKING,
                    cosmeticGrade: CosmeticGrade.GOOD,
                    screenDefect: false,
                    cameraDefect: false,
                    speakerDefect: false,
                    portDefect: false,
                    buttonDefect: false,
                    additionalNotes: '외관 양호, 화면/카메라/배터리 정상 (부품 활용 가능)',
                },
            },
            defects: {
                create: [
                    {
                        defectType: 'SOFTWARE_ISSUE',
                        severity: 'CRITICAL',
                        description: '메인보드 고장으로 전원 안 켜짐',
                    },
                ],
            },
            images: {
                create: [
                    {
                        url: 'https://via.placeholder.com/800x600?text=Galaxy+S21+Ultra',
                        imageType: 'MAIN',
                        order: 1,
                    },
                ],
            },
        },
    });

    const _product3 = await prisma.product.create({
        data: {
            sellerId: seller1.id,
            categoryId: macbookCategory.id,
            name: 'MacBook Pro 2019 15인치 (배터리 문제)',
            description: '배터리가 부풀어서 트랙패드 눌림이 안 됩니다. 전원 연결 시 정상 작동.',
            brand: 'Apple',
            model: 'MacBook Pro 15 2019',
            serialNumber: 'C02XXXXXXX',
            originalPrice: 2800000,
            sellingPrice: 850000,
            status: 'ACTIVE',
            purchaseDate: new Date('2019-07-20'),
            isForParts: false,
            isRepairable: true,
            repairNotes: '배터리 교체 필요. 공식 AS 약 30만원',
            condition: {
                create: {
                    overallGrade: OverallGrade.C_FAIR,
                    functionalStatus: FunctionalStatus.PARTIALLY_WORKING,
                    cosmeticGrade: CosmeticGrade.GOOD,
                    screenDefect: false,
                    cameraDefect: false,
                    speakerDefect: false,
                    portDefect: false,
                    buttonDefect: true,
                    additionalNotes: '배터리 부풀어서 트랙패드 클릭 불가, 마우스 사용 필요',
                },
            },
            defects: {
                create: [
                    {
                        defectType: 'BATTERY_SWOLLEN',
                        severity: 'SEVERE',
                        description: '배터리 팽창으로 트랙패드 버튼 작동 불가',
                    },
                ],
            },
            images: {
                create: [
                    {
                        url: 'https://via.placeholder.com/800x600?text=MacBook+Pro',
                        imageType: 'MAIN',
                        order: 1,
                    },
                ],
            },
        },
    });

    console.log('✅ Products created');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Test accounts:');
    console.log('Admin: admin@marketplace.com / password123');
    console.log('Seller 1: seller1@gmail.com / password123');
    console.log('Seller 2: seller2@gmail.com / password123');
    console.log('Buyer: buyer@gmail.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
