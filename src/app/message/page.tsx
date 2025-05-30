"use client";
import ErrorPage from "@/components/ErrorPage";
import MessageEditor from "@/components/MessageEditor";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const params = useSearchParams();
  const id = params.get("id");

  if (!id) return <ErrorPage message="Unknown editor" />;

  return (
    <main className="bg-background text-text h-screen">
      <div className="max-w-8xl mx-auto p-2 h-full flex flex-col">
        <div className="flex-1 min-h-0">
          <MessageEditor id={id} />
        </div>
      </div>
    </main>
  );
}
