import Link from 'next/link';
import { Mic, BarChart3, Users, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600">InterviewPrep</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-5xl font-bold text-gray-900 leading-tight">
          AI-Powered Mock Interviews
          <br />
          <span className="text-indigo-600">for People Breaking Into Tech</span>
        </h2>
        <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
          Real conversational interviews with voice support. Paste a job
          description and get a tailored interview. Instant AI analysis with
          scores, strengths, and actionable feedback.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Start Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mic className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">
              Voice Interviews
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              Speak naturally, just like a real interview. AI interviewer asks
              questions, listens, and follows up contextually.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">
              Instant Analysis
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              Get scored on a 1-10 scale with detailed strengths, weaknesses,
              and specific improvement suggestions.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">
              Job Description Matching
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              Paste a real job description and the AI tailors every question to
              match the role&apos;s requirements and tech stack.
            </p>
          </div>
        </div>
      </section>

      {/* Interview types */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Three Interview Types, Five Fields
          </h3>
          <div className="flex justify-center gap-4 mb-6">
            <span className="bg-white px-4 py-2 rounded-lg border text-sm font-medium">
              Behavioral
            </span>
            <span className="bg-white px-4 py-2 rounded-lg border text-sm font-medium">
              Technical
            </span>
            <span className="bg-white px-4 py-2 rounded-lg border text-sm font-medium">
              System Design
            </span>
          </div>
          <div className="flex justify-center gap-3">
            {[
              'DevOps',
              'Cyber Security',
              'Project Management',
              'Data',
              'Business Intelligence',
            ].map((field) => (
              <span
                key={field}
                className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
        InterviewPrep - Built for people breaking into tech.
      </footer>
    </div>
  );
}
