"use client";
import CollapsibleSection from "@/components/Collapsible";
import PlaceholderTable, { Placeholder } from "@/components/PlaceholderTable";

const serverPlaceholders: Placeholder[] = [
  {
    key: "server.id",
    description: "The ID of the server the message is used in",
  },
  {
    key: "server.name",
    description: "The name of the server the message is used in",
  },
  {
    key: "server.boosts",
    description: "The number of boosts the server has",
  },
  {
    key: "server.members",
    description: "The number of members in the server",
  },
];

const channelPlaceholders: Placeholder[] = [
  {
    key: "channel.id",
    description: "The ID of a channel",
  },
  {
    key: "channel.name",
    description: "The name of a channel",
  },
];

const functions: Placeholder[] = [
  {
    key: "upper()",
    description: "Make a placeholder uppercase",
  },
  {
    key: "lower()",
    description: "Make a placeholder lowercase",
  },
];

const applicationPlaceholders: Placeholder[] = [
  {
    key: "applicationName",
    description: "The name of the application",
  },
  {
    key: "question",
    description: "[Available in active application] The current question",
  },
  {
    key: "questionNumber",
    description:
      "[Available in active application] The current question number",
  },
  {
    key: "totalQuestions",
    description:
      "[Available in active application] The total number of questions in the application",
  },
  {
    key: "max",
    description:
      "[Available in active application] The upper character limit of the question response (or max choices)",
  },
  {
    key: "min",
    description:
      "[Available in active application] The lower character limit of the question response (or min choices)",
  },
];

const userPlaceholders: Placeholder[] = [
  {
    key: "user.id",
    description: "The ID of a user",
  },
  {
    key: "user.username",
    description: "A user's username",
  },
  {
    key: "user.displayname",
    description: "A user's display name",
  },
  {
    key: "user.avatar",
    description: "A link to the user's avatar (use in image fields)",
  },
  {
    key: "member.roles.ids",
    description: "A list of a users roles (IDs)",
  },
  {
    key: "member.roles.mentions",
    description: "A list of a users roles, formatted as mentions",
  },
  {
    key: "member.roles.names",
    description: "A list of a users role names",
  },
  {
    key: "member.roles.flat",
    description: "A flattened list of a users roles (@role)",
  },
  {
    key: "member.roles.highest.mention",
    description: "A user's highest role as a mention",
  },
  {
    key: "member.roles.highest.id",
    description: "A user's highest role as an ID",
  },
  {
    key: "member.roles.highest.name",
    description: "The name of a user's highest role",
  },
  {
    key: "member.roles.highest.flat",
    description: "The flattened name of a user's highest role (@role)",
  },
  {
    key: "member.nickname",
    description: "The nickname or username of a user",
  },
];

export default function PlaceholderPage() {
  return (
    <div className="h-screen">
      <div className="flex flex-col justify-center items-center gap-4 h-full text-center">
        <div>
          <p className="text-3xl font-bold">Placeholders</p>
          <p>
            This is a full list of all the placeholders that can be used
            throughout the bot
          </p>
        </div>
        <CollapsibleSection title="Functions - Used to modify placeholders">
          <p>
            You should use functions like{" "}
            <span className="text-accent">{`{functionName(placeholder)}`}</span>
          </p>
          <PlaceholderTable placeholders={functions} />
        </CollapsibleSection>
        <CollapsibleSection title="Server">
          <PlaceholderTable placeholders={serverPlaceholders} />
        </CollapsibleSection>
        <CollapsibleSection title="User">
          <PlaceholderTable placeholders={userPlaceholders} />
        </CollapsibleSection>
        <CollapsibleSection title="Channel">
          <PlaceholderTable placeholders={channelPlaceholders} />
        </CollapsibleSection>
        <CollapsibleSection title="Applications">
          <PlaceholderTable placeholders={applicationPlaceholders} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
