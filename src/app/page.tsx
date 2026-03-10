'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Mic,
  BarChart3,
  ClipboardPaste,
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Server,
  FolderKanban,
  Database,
  TrendingUp,
} from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const features = [
  {
    icon: Mic,
    title: 'Voice Interviews',
    description:
      'Speak naturally, just like a real interview. The AI interviewer asks questions, listens, and follows up contextually.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: BarChart3,
    title: 'Instant Analysis',
    description:
      'Get scored on a 1-10 scale with detailed strengths, weaknesses, and specific improvement suggestions.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: ClipboardPaste,
    title: 'Job Description Matching',
    description:
      'Paste a real job description and the AI tailors every question to match the role\u2019s requirements and tech stack.',
    color: 'bg-purple-100 text-purple-600',
  },
];

const fields = [
  { icon: Server, label: 'DevOps', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { icon: Shield, label: 'Cyber Security', color: 'bg-red-50 text-red-600 border-red-200' },
  { icon: FolderKanban, label: 'Project Management', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { icon: Database, label: 'Data', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { icon: TrendingUp, label: 'Business Intelligence', color: 'bg-violet-50 text-violet-600 border-violet-200' },
];

const steps = [
  {
    step: '01',
    title: 'Set Your Target',
    description: 'Pick your field, target role, and experience level. Optionally paste a job description.',
  },
  {
    step: '02',
    title: 'Interview with AI',
    description: 'Have a real conversation with an AI interviewer using voice or text. Code editor included for technical rounds.',
  },
  {
    step: '03',
    title: 'Get Your Analysis',
    description: 'Receive an instant score with specific strengths, weaknesses, and actionable suggestions to improve.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">InterviewPrep</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-32">
        {/* Atmospheric gradient orbs */}
        <div className="hero-orb w-[500px] h-[500px] bg-indigo-400 -top-20 -left-40 animate-[pulse-soft_3s_ease-in-out_infinite]" />
        <div className="hero-orb w-[400px] h-[400px] bg-purple-400 top-40 -right-32 animate-[pulse-soft_3s_ease-in-out_infinite_1s]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-[fade-down_0.6s_ease-out_forwards]">
              <Star className="h-4 w-4" />
              AI-Powered Interview Practice
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight animate-[fade-up_0.7s_cubic-bezier(0.16,1,0.3,1)_forwards]">
              Ace Your Next
              <br />
              <span className="gradient-text">Tech Interview</span>
            </h2>
            <p className="text-lg text-gray-500 mt-6 max-w-lg leading-relaxed animate-[fade-up_0.7s_cubic-bezier(0.16,1,0.3,1)_0.15s_forwards] opacity-0">
              Practice with an AI interviewer that adapts to your target role.
              Paste a job description, have a real conversation, and get instant
              feedback to improve.
            </p>
            <div className="flex items-center gap-4 mt-8 animate-[fade-up_0.7s_cubic-bezier(0.16,1,0.3,1)_0.3s_forwards] opacity-0">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-indigo-700 transition-all hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5"
              >
                Start Practicing Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <span className="text-sm text-gray-400">No credit card required</span>
            </div>
          </div>

          {/* Right: Hero image */}
          <div className="relative animate-[fade-up_0.8s_cubic-bezier(0.16,1,0.3,1)_0.2s_forwards] opacity-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-200/50">
              <Image
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80"
                alt="Professional preparing for a tech interview"
                width={800}
                height={533}
                className="w-full h-auto object-cover"
                priority
              />
              {/* Floating badge */}
              <div className="absolute bottom-4 left-4 glass-card rounded-xl px-4 py-3 animate-[float_6s_ease-in-out_infinite]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">Interview Score</p>
                    <p className="text-lg font-bold text-green-600">8.5/10</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fields strip */}
      <ScrollReveal>
        <section className="bg-gray-50 py-10 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-sm text-gray-400 mb-6 uppercase tracking-wider font-medium">
              Practice for roles across
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {fields.map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md ${color}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Everything you need to
              <span className="gradient-text"> land the job</span>
            </h3>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              More than flashcards. A real interview experience with voice,
              code editors, and AI that knows what hiring managers look for.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal stagger>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="group p-8 rounded-2xl border border-gray-100 hover-lift bg-white"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${color} transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 text-lg">{title}</h4>
                <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                How it works
              </h3>
              <p className="text-gray-500 mt-4">
                Three steps to interview confidence.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ step, title, description }, i) => (
              <ScrollReveal key={step} delay={i * 150}>
                <div className="relative p-8 rounded-2xl bg-white border border-gray-100 hover-lift">
                  <span className="text-5xl font-black text-indigo-100">
                    {step}
                  </span>
                  <h4 className="font-semibold text-gray-900 text-lg mt-4">
                    {title}
                  </h4>
                  <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Interview types with image */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal direction="left">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                alt="Team collaborating on technical problems"
                width={800}
                height={533}
                className="w-full h-auto object-cover"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                Three interview types,{' '}
                <span className="gradient-text">one platform</span>
              </h3>
              <p className="text-gray-500 mt-4 leading-relaxed">
                Whether you&apos;re preparing for a behavioral round, a technical
                coding challenge, or a system design session, we&apos;ve got you
                covered.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  {
                    name: 'Behavioral',
                    desc: 'STAR method, soft skills, leadership scenarios',
                  },
                  {
                    name: 'Technical',
                    desc: 'Coding problems with a built-in code editor',
                  },
                  {
                    name: 'System Design',
                    desc: 'Architecture discussions with a whiteboard tool',
                  },
                ].map(({ name, desc }) => (
                  <div key={name} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{name}</p>
                      <p className="text-sm text-gray-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* JD Paste feature highlight */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <ClipboardPaste className="h-4 w-4" />
                  New Feature
                </div>
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Paste a job description,{' '}
                  <span className="gradient-text">get a tailored interview</span>
                </h3>
                <p className="text-gray-500 mt-4 leading-relaxed">
                  Found a job posting you love? Paste the description and our AI
                  will generate interview questions that match the exact
                  requirements, technologies, and responsibilities listed.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    'Questions based on required skills and tools',
                    'Difficulty calibrated to experience level',
                    'Analysis scored against the JD requirements',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80"
                  alt="Person working on laptop preparing for interview"
                  width={800}
                  height={533}
                  className="w-full h-auto object-cover"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Ready to
              <span className="gradient-text"> break into tech?</span>
            </h3>
            <p className="text-gray-500 mt-4 text-lg">
              Start practicing today. No credit card required.
            </p>
            <div className="mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-indigo-700 transition-all hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <Mic className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">InterviewPrep</span>
          </div>
          <p className="text-sm text-gray-400">
            Built for people breaking into tech.
          </p>
        </div>
      </footer>
    </div>
  );
}
