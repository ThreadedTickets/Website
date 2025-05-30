"use client";
import Button from "@/components/buttons/Default";
import FancyButton from "@/components/buttons/Fancy";

export default function Home() {
  return (
    <div className="bg-background h-screen text-text">
      <div className="flex flex-col justify-center h-full items-center gap-4">
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
            <Button text="Documentation" />
          </div>
        </div>
      </div>
    </div>
  );
}
