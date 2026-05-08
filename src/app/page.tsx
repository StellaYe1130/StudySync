import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">StudySync</h1>
          <p className="text-gray-500 text-sm mt-1">Group work, made better</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full bg-violet-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg text-center hover:bg-violet-700 transition"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="w-full border border-gray-200 text-gray-700 text-sm font-medium py-2.5 px-4 rounded-lg text-center hover:bg-gray-50 transition"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}