import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Store, ShieldAlert, LogOut, ArrowLeft } from "lucide-react";

async function SalesView() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const isOwner = session.role === "OWNER";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {isOwner && (
              <Link
                href="/brand"
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                title="Back to Brand Overview"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">In-Store Sales Attribution</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{session.name}</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full border text-[11px] ${
                    isOwner
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : "text-teal-700 bg-teal-50 border-teal-200"
                  }`}
                >
                  {session.role}
                </span>
              </div>
            </div>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 text-teal-800 text-xs">
            <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              {isOwner
                ? "You are logged in as a Brand Owner. You can log sales or return to the main dashboard."
                : "Staff access active: You have access to log customer promo code sales in ETB. Financial and campaign configurations remain restricted."}
            </span>
          </div>

          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Sales Attribution Console</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Sales logging form with Ethiopian Birr (ETB) input and campaign promo-code matching will activate in Ticket #6.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SalesLoggingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SalesView />
    </Suspense>
  );
}
