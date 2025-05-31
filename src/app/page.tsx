"use client";
import Button from "@/components/buttons/Default";
import FancyButton from "@/components/buttons/Fancy";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="bg-background h-screen text-text">
      <div className="flex flex-col justify-center h-full items-center gap-4">
        <div className="flex flex-col justify-center gap-4 grow">
          <div className="text-center">
            <p className="text-6xl font-bold">Threaded</p>
            <p className="text-2xl">Ticketing without limits</p>
          </div>
          <div className="flex flex-col gap-4 w-fit justify-center">
            <FancyButton
              text="Invite Threaded"
              onClick={() =>
                window.open(
                  "https://discord.com/oauth2/authorize?client_id=1068627569760550994",
                  "_blank"
                )
              }
            />
            <div className="flex gap-4">
              <Button
                text="Support"
                onClick={() =>
                  window.open("https://discord.gg/9jFqS5H43Q", "_blank")
                }
              />
              <Button
                text="Placeholders"
                onClick={() => router.push("/placeholders")}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-text/50">
          <a href="/terms" className="hover:text-text/70">
            <p>Terms</p>
          </a>
          <a href="/status" className="hover:text-text/70">
            <p>Status</p>
          </a>
          <a href="/privacy" className="hover:text-text/70">
            <p>Privacy</p>
          </a>
        </div>
      </div>
    </div>
  );
}
