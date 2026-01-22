import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-24 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            전자제품 하자 마켓플레이스
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            고장나거나 하자가 있는 전자제품을 투명하게 거래하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300 shadow-lg hover:shadow-xl"
            >
              제품 둘러보기
            </Link>
            <Link
              href="/auth/register"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition duration-300"
            >
              시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            왜 하자 마켓플레이스인가요?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">투명한 상태 공개</h3>
              <p className="text-gray-600">
                A/B/C/D/F 등급 시스템과 상세한 하자 내역으로 제품 상태를 정확하게 파악하세요.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
              <div className="text-4xl mb-4">♻️</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">지속 가능성</h3>
              <p className="text-gray-600">
                고장난 제품도 수리하거나 부품으로 활용하여 환경을 보호합니다.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">합리적인 가격</h3>
              <p className="text-gray-600">
                하자 정도에 따른 정확한 가격 책정으로 공정한 거래를 실현합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">이용 방법</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">회원가입</h3>
              <p className="text-gray-300">구매자 또는 판매자로 가입</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">제품 탐색</h3>
              <p className="text-gray-300">상태 등급별로 필터링</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">안전한 결제</h3>
              <p className="text-gray-300">Stripe를 통한 보안 결제</p>
            </div>
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">리뷰 작성</h3>
              <p className="text-gray-300">상태 정확도 평가</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="container mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">지금 시작하세요</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            고장난 전자제품도 가치가 있습니다. 합리적인 가격에 거래해보세요.
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition duration-300 shadow-xl"
          >
            제품 보러 가기 →
          </Link>
        </div>
      </section>
    </div>
  );
}
