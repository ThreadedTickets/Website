"use client";
import ExportButton from "@/components/buttons/Export";
import ErrorPage from "@/components/ErrorPage";
import PermissionToggle from "@/components/inputs/PermissionToggle";
import TagSelectInput from "@/components/inputs/TagSelectInput";
import TextInput from "@/components/inputs/TextInput";
import ExportStatusOverlay from "@/components/overlays/ExportOverlay";
import InfoTooltip from "@/components/overlays/InfoTooltip";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Role {
  id: string;
  name: string;
  colour: string;
}

interface Group {
  name: string;
  roles: string[];
  extraMembers: string[];
  permissions: {
    tickets: {
      canClose: boolean;
      canCloseIfOwn: boolean;
      canForceOpen: boolean;
      canMove: boolean;
      canLock: boolean;
      canUnlock: boolean;
      canViewTranscripts: boolean;
      canViewLockedTranscripts: boolean;
      channelPermissions: {
        allow: string[];
        deny: string[];
      };
    };
    messages: {
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    tags: {
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    autoResponders: {
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    applications: {
      manage: boolean;
      respond: boolean;
    };
    panels: {
      manage: boolean;
    };
  };
}

type ChannelPermState = "allow" | "deny" | "neutral";

function getChannelPermissionState(
  permission: string,
  group: Group
): ChannelPermState {
  const { allow, deny } = group.permissions.tickets.channelPermissions;
  if (allow.includes(permission)) return "allow";
  if (deny.includes(permission)) return "deny";
  return "neutral";
}

function setChannelPermissionState(
  permission: string,
  state: ChannelPermState,
  group: Group,
  setGroup: (g: Group) => void
) {
  const { allow, deny } = group.permissions.tickets.channelPermissions;
  const newAllow = [...allow];
  const newDeny = [...deny];

  // Remove from both
  const remove = (arr: string[]) => {
    const index = arr.indexOf(permission);
    if (index !== -1) arr.splice(index, 1);
  };
  remove(newAllow);
  remove(newDeny);

  if (state === "allow") newAllow.push(permission);
  else if (state === "deny") newDeny.push(permission);

  setGroup({
    ...group,
    permissions: {
      ...group.permissions,
      tickets: {
        ...group.permissions.tickets,
        channelPermissions: {
          allow: newAllow,
          deny: newDeny,
        },
      },
    },
  });
}

export default function GroupPage() {
  const params = useSearchParams();
  const id = params.get("id");

  const [exportStatus, setExportStatus] = useState<
  "NULL" | "LOADING" | "SUCCESSFUL" | "ERROR"
  >("NULL");
  const [exportError, setExportError] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  const fetchData = async (id: string) => {
    const res = await fetch(`/api/create/group/check?id=${id}`);
    if (!res.ok) throw new Error("Failed to fetch message");
    const data = await res.json();

    if (data.data) {
      setRoles(data.data.metadata.roles);
      if (data.data.existingGroup) {
        setGroup(data.data.existingGroup);
      } else {
        setGroup({
          name: "",
          roles: [],
          extraMembers: [],
          permissions: {
            tickets: {
              canClose: false,
              canCloseIfOwn: false,
              canForceOpen: false,
              canMove: false,
              canLock: false,
              canUnlock: false,
              canViewTranscripts: false,
              canViewLockedTranscripts: false,
              channelPermissions: { allow: [], deny: [] },
            },
            messages: { create: false, edit: false, delete: false },
            tags: { create: false, edit: false, delete: false },
            autoResponders: { create: false, edit: false, delete: false },
            applications: { manage: false, respond: false },
            panels: { manage: false },
          },
        });
      }
    } else {
      setExportError(
        "Invalid editor, please use the Threaded create command for a valid link: Error 0002"
      );
      setExportStatus("ERROR");
    }
  };
  useEffect(() => {
    if (id) fetchData(id);
  }, [id]);
  
  if (!id) return <ErrorPage message="Unknown editor" />;
  const handleExport = async () => {
    setExportStatus("LOADING");
    setExportError(null);

    try {
      const exportPayload = group;

      const res = await fetch(`/api/create/group/save?id=${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message =
          errorData?.message ||
          errorData?.error ||
          res.statusText ||
          "Unknown error occurred";
        throw new Error(message);
      }

      setExportStatus("SUCCESSFUL");
    } catch (err: any) {
      setExportStatus("ERROR");
      setExportError(err.message || "Something went wrong.");
    }
  };

  if (!group)
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        {exportStatus === "NULL" && (
          <span className="text-text">Loading group editor...</span>
        )}
        {exportStatus === "ERROR" && (
          <span className="text-text">{exportError}</span>
        )}
      </div>
    );

  const toggle = (path: string[]) => {
    const copy = structuredClone(group.permissions);
    let ref: any = copy;
    for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
    const key = path[path.length - 1];
    ref[key] = !ref[key];
    setGroup({ ...group, permissions: copy });
  };

  return (
    <main className="bg-background text-text min-h-screen">
      <div className="max-w-8xl mx-auto p-2 h-full flex flex-col">
        <div className="flex flex-col gap-4 min-h-0 p-4">
          <ExportStatusOverlay
            status={exportStatus}
            error={exportError}
            setStatus={setExportStatus}
          />

          <div
            id="general"
            className="bg-midground rounded-lg p-4 overflow-visible flex flex-wrap gap-2 justify-between"
          >
            <p className="font-extrabold text-3xl my-auto text-center">
              Permission Group Editor
            </p>
            <div className="grow hidden lg:block" />
            <ExportButton handleExport={handleExport} />
          </div>

          <div
            id="general"
            className="bg-midground rounded-lg p-4 overflow-visible"
          >
            <p className="font-extrabold text-3xl">General Settings</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-2 gap-4">
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Group Name</p>
                  <p className="opacity-70">
                    The name of this permission group
                  </p>
                </div>
                <TextInput
                  value={group.name}
                  onChange={(e) => setGroup({ ...group, name: e.target.value })}
                  className="grow"
                  placeholder="New Application"
                  max={64}
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Roles</p>
                  <p className="opacity-70">
                    Users with ANY of these roles will be part of this group
                  </p>
                </div>
                <TagSelectInput
                  options={roles.map((r) => ({ label: r.name, value: r.id }))}
                  selected={group.roles}
                  onChange={(e) =>
                    setGroup({
                      ...group,
                      roles: e,
                    })
                  }
                  className="grow"
                  placeholder="Select roles"
                  max={10}
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Extra Members</p>
                  <p className="opacity-70">
                    These users will also be part of this group regardless of if
                    they have one of the roles
                  </p>
                </div>
                <TagSelectInput
                  options={[]}
                  selected={group.extraMembers}
                  allowCustom
                  onChange={(e) =>
                    setGroup({
                      ...group,
                      extraMembers: e,
                    })
                  }
                  className="grow"
                  placeholder="Select extra members (paste their User ID)"
                  max={10}
                />
              </div>
            </div>
          </div>

          <div
            id="channel"
            className="bg-midground rounded-lg p-4 overflow-visible"
          >
            <p className="font-extrabold text-3xl">
              Ticket Channel Permissions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 my-2 gap-4">
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Manage Channel</p>
                    <PermissionToggle
                      value={getChannelPermissionState("ManageChannels", group)}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "ManageChannels",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <div className="flex gap-2">
                      <p className="my-auto">Create Public Threads</p>
                      <InfoTooltip>
                        <p>This will only apply on channel tickets</p>
                      </InfoTooltip>
                    </div>
                    <PermissionToggle
                      value={getChannelPermissionState(
                        "CreatePublicThreads",
                        group
                      )}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "CreatePublicThreads",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <div className="flex gap-2">
                      <p className="my-auto">Create Private Threads</p>
                      <InfoTooltip>
                        <p>This will only apply on channel tickets</p>
                      </InfoTooltip>
                    </div>
                    <PermissionToggle
                      value={getChannelPermissionState(
                        "CreatePrivateThreads",
                        group
                      )}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "CreatePrivateThreads",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Manage Messages</p>
                    <PermissionToggle
                      value={getChannelPermissionState("ManageMessages", group)}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "ManageMessages",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <div className="flex gap-2">
                      <p className="my-auto">Manage Webhooks</p>
                      <InfoTooltip>
                        <p>This will only apply on channel tickets</p>
                      </InfoTooltip>
                    </div>
                    <PermissionToggle
                      value={getChannelPermissionState("ManageWebhooks", group)}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "ManageWebhooks",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <div className="flex gap-2">
                      <p className="my-auto">Create Invites</p>
                      <InfoTooltip>
                        <p>This will only apply on channel tickets</p>
                      </InfoTooltip>
                    </div>
                    <PermissionToggle
                      value={getChannelPermissionState(
                        "CreateInstantInvite",
                        group
                      )}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "CreateInstantInvite",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Use Slash Commands</p>
                    <PermissionToggle
                      value={getChannelPermissionState(
                        "UseApplicationCommands",
                        group
                      )}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "UseApplicationCommands",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Use External Apps</p>
                    <PermissionToggle
                      value={getChannelPermissionState(
                        "UseExternalApps",
                        group
                      )}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "UseExternalApps",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Send Messages</p>
                    <PermissionToggle
                      value={getChannelPermissionState("SendMessages", group)}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "SendMessages",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Send Voice Messages</p>
                    <PermissionToggle
                      value={getChannelPermissionState(
                        "SendVoiceMessages",
                        group
                      )}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "SendVoiceMessages",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Send TTS Messages</p>
                    <PermissionToggle
                      value={getChannelPermissionState(
                        "SendTTSMessages",
                        group
                      )}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "SendTTSMessages",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Send Polls</p>
                    <PermissionToggle
                      value={getChannelPermissionState("SendPolls", group)}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "SendPolls",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <p className="my-auto">React to messages</p>
                    <PermissionToggle
                      value={getChannelPermissionState("AddReactions", group)}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "AddReactions",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Use External Emojis</p>
                    <PermissionToggle
                      value={getChannelPermissionState(
                        "UseExternalEmojis",
                        group
                      )}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "UseExternalEmojis",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Use External Stickers</p>
                    <PermissionToggle
                      value={getChannelPermissionState(
                        "UseExternalStickers",
                        group
                      )}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "UseExternalStickers",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Embedded Links</p>
                    <PermissionToggle
                      value={getChannelPermissionState("EmbedLinks", group)}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "EmbedLinks",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <div className="flex gap-2">
                      <p className="my-auto">View Channel</p>
                      <InfoTooltip>
                        <p>This will only apply on channel tickets</p>
                      </InfoTooltip>
                    </div>
                    <PermissionToggle
                      value={getChannelPermissionState("ViewChannel", group)}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "ViewChannel",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Read Message History</p>
                    <PermissionToggle
                      value={getChannelPermissionState(
                        "ReadMessageHistory",
                        group
                      )}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "ReadMessageHistory",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Upload Files</p>
                    <PermissionToggle
                      value={getChannelPermissionState("AttachFiles", group)}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "AttachFiles",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Mention @everyone</p>
                    <PermissionToggle
                      value={getChannelPermissionState(
                        "MentionEveryone",
                        group
                      )}
                      onChange={(e) =>
                        setChannelPermissionState(
                          "MentionEveryone",
                          e,
                          group,
                          setGroup
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            id="tickets"
            className="bg-midground rounded-lg p-4 overflow-visible"
          >
            <p className="font-extrabold text-3xl">
              Ticket Management Permissions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 my-2 gap-4">
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Close Tickets</p>
                    <PermissionToggle
                      value={
                        group.permissions.tickets.canClose ? "allow" : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["tickets", "canClose"])}
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Close Owned Tickets</p>
                    <PermissionToggle
                      value={
                        group.permissions.tickets.canCloseIfOwn
                          ? "allow"
                          : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["tickets", "canCloseIfOwn"])}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Lock Tickets</p>
                    <PermissionToggle
                      value={
                        group.permissions.tickets.canLock ? "allow" : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["tickets", "canLock"])}
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Unlock Tickets</p>
                    <PermissionToggle
                      value={
                        group.permissions.tickets.canUnlock ? "allow" : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["tickets", "canUnlock"])}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Force Open Tickets</p>
                    <PermissionToggle
                      value={
                        group.permissions.tickets.canForceOpen
                          ? "allow"
                          : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["tickets", "canForceOpen"])}
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Move Tickets</p>
                    <PermissionToggle
                      value={
                        group.permissions.tickets.canMove ? "allow" : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["tickets", "canMove"])}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <p className="my-auto">View Transcripts</p>
                    <PermissionToggle
                      value={
                        group.permissions.tickets.canViewTranscripts
                          ? "allow"
                          : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["tickets", "canViewTranscripts"])}
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">View Locked Transcripts</p>
                    <PermissionToggle
                      value={
                        group.permissions.tickets.canViewLockedTranscripts
                          ? "allow"
                          : "deny"
                      }
                      noNeutral
                      onChange={() =>
                        toggle(["tickets", "canViewLockedTranscripts"])
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            id="other"
            className="bg-midground rounded-lg p-4 overflow-visible"
          >
            <p className="font-extrabold text-3xl">Other Permissions</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 my-2 gap-4">
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Messages</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Create Messages</p>
                    <PermissionToggle
                      value={
                        group.permissions.messages.create ? "allow" : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["messages", "create"])}
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Edit Messages</p>
                    <PermissionToggle
                      value={group.permissions.messages.edit ? "allow" : "deny"}
                      noNeutral
                      onChange={() => toggle(["messages", "edit"])}
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Delete Messages</p>
                    <PermissionToggle
                      value={
                        group.permissions.messages.delete ? "allow" : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["messages", "delete"])}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Tags</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Create Tags</p>
                    <PermissionToggle
                      value={group.permissions.tags.create ? "allow" : "deny"}
                      noNeutral
                      onChange={() => toggle(["tags", "create"])}
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Edit Tags</p>
                    <PermissionToggle
                      value={group.permissions.tags.edit ? "allow" : "deny"}
                      noNeutral
                      onChange={() => toggle(["tags", "edit"])}
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Delete Tags</p>
                    <PermissionToggle
                      value={group.permissions.tags.delete ? "allow" : "deny"}
                      noNeutral
                      onChange={() => toggle(["tags", "delete"])}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Auto Responders</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Create Responders</p>
                    <PermissionToggle
                      value={
                        group.permissions.autoResponders.create
                          ? "allow"
                          : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["autoResponders", "create"])}
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Edit Responders</p>
                    <PermissionToggle
                      value={
                        group.permissions.autoResponders.edit ? "allow" : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["autoResponders", "edit"])}
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Delete Responders</p>
                    <PermissionToggle
                      value={
                        group.permissions.autoResponders.delete
                          ? "allow"
                          : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["autoResponders", "delete"])}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Applications</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <div className="flex gap-2">
                      <p className="my-auto">Manage Applications</p>
                      <InfoTooltip>
                        <p>Create/Edit/Delete applications</p>
                      </InfoTooltip>
                    </div>
                    <PermissionToggle
                      value={
                        group.permissions.applications.manage ? "allow" : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["applications", "manage"])}
                    />
                  </div>
                  <div className="flex w-full justify-between">
                    <div className="flex gap-2">
                      <p className="my-auto">Respond to Applications</p>
                      <InfoTooltip>
                        <p>Decide a verdict</p>
                      </InfoTooltip>
                    </div>
                    <PermissionToggle
                      value={
                        group.permissions.applications.respond
                          ? "allow"
                          : "deny"
                      }
                      noNeutral
                      onChange={() => toggle(["applications", "respond"])}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Panels</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex w-full justify-between">
                    <p className="my-auto">Manage Panels</p>
                    <PermissionToggle
                      value={group.permissions.panels.manage ? "allow" : "deny"}
                      noNeutral
                      onChange={() => toggle(["panels", "manage"])}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
