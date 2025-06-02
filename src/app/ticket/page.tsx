"use client";
import ErrorPage from "@/components/ErrorPage";
import TextInput from "@/components/inputs/TextInput";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SelectInput from "@/components/inputs/SelectInput";
import CheckboxInput from "@/components/inputs/CheckboxInput";
import TagSelectInput from "@/components/inputs/TagSelectInput";
import NumberInput from "@/components/inputs/NumberInput";
import ExportButton from "@/components/buttons/Export";
import CollapsibleSection from "@/components/Collapsible";
import ExportStatusOverlay from "@/components/overlays/ExportOverlay";
import TextareaInput from "@/components/inputs/TextAreaInput";

type FormSchema = {
  question: string;
  multilineResponse: boolean;
  requiredResponse: boolean;
  minimumCharactersRequired: number | null;
  maximumCharactersRequired: number | null;
  defaultValue: string | null;
  placeholder: string | null;
};

type TicketTrigger = {
  label: string;
  description: string | null;
  emoji: string | null;
  colour: number;
  message: string | null;
  form: FormSchema[];
  groups: string[];
  openChannel: string | null;
  closeChannel: string | null;
  isThread: boolean;
  addRolesOnOpen: string[];
  addRolesOnClose: string[];
  removeRolesOnClose: string[];
  removeRolesOnOpen: string[];
  hideUsersInTranscript: boolean;
  allowRaising: boolean;
  defaultToRaised: boolean;
  closeOnLeave: boolean;
  sendCopyOfFormInTicket: boolean;
  notifyStaff: string[]; // Will also forcefully be the group roles and members for thread tickets
  channelNameFormat: string;
  userLimit: number;
  serverLimit: number;
  takeTranscripts: boolean;
  allowReopening: boolean;
  allowAutoresponders: boolean;
  syncChannelPermissionsWhenMoved: boolean;
  categoriesAvailableToMoveTicketsTo: string[];
  requiredRoles: string[];
  bannedRoles: string[];
  dmOnClose: string | null;
};

const generateBlankQuestion = () => {
  return {
    question: "New Question",
    multilineResponse: false,
    requiredResponse: false,
    minimumCharactersRequired: null,
    maximumCharactersRequired: null,
    defaultValue: null,
    placeholder: null,
  } as FormSchema;
};

export default function TicketTriggerPage() {
  const params = useSearchParams();
  const id = params.get("id");
  const [exportStatus, setExportStatus] = useState<
    "NULL" | "LOADING" | "SUCCESSFUL" | "ERROR"
  >("NULL");
  const [exportError, setExportError] = useState<string | null>(null);

  const [trigger, setTrigger] = useState<TicketTrigger | null>(null);

  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [messages, setMessages] = useState<{ label: string; value: string }[]>(
    []
  );
  const [textChannels, setTextChannels] = useState<
    { label: string; value: string }[]
  >([]);
  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const [groups, setGroups] = useState<{ label: string; value: string }[]>([]);

  const fetchData = async (id: string) => {
    const res = await fetch(`/api/create/ticket/check?id=${id}`);
    if (!res.ok) throw new Error("Failed to fetch message");
    const data = await res.json();

    if (data.data) {
      setRoles(data.data.metadata.roles);
      setTextChannels(data.data.metadata.textChannels);
      setCategories(data.data.metadata.categories);
      setMessages(data.data.metadata.messages);
      setGroups(data.data.metadata.groups);
      if (data.data.existingTrigger) {
        setTrigger(data.data.existingTrigger);
      } else {
        setTrigger({
          addRolesOnClose: [],
          addRolesOnOpen: [],
          allowRaising: true,
          channelNameFormat: "ticket-{user.username}",
          closeChannel: null,
          colour: 1,
          defaultToRaised: false,
          description: null,
          emoji: null,
          groups: [],
          isThread: false,
          label: "New Trigger",
          message: null,
          openChannel: null,
          removeRolesOnClose: [],
          removeRolesOnOpen: [],
          notifyStaff: [],
          requiredRoles: [],
          bannedRoles: [],
          form: [],
          hideUsersInTranscript: false,
          sendCopyOfFormInTicket: true,
          closeOnLeave: false,
          serverLimit: 0,
          userLimit: 1,
          takeTranscripts: true,
          allowReopening: false,
          allowAutoresponders: true,
          syncChannelPermissionsWhenMoved: false,
          categoriesAvailableToMoveTicketsTo: [],
          dmOnClose: null,
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
      const exportPayload = trigger;

      const res = await fetch(`/api/create/ticket/save?id=${id}`, {
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

  if (!trigger)
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        {exportStatus === "NULL" && (
          <span className="text-text">Loading ticket trigger editor...</span>
        )}
        {exportStatus === "ERROR" && (
          <span className="text-text">{exportError}</span>
        )}
      </div>
    );

  return (
    <main className="bg-background text-text min-h-screen">
      <div className="max-w-8xl mx-auto p-4 h-full flex flex-col overflow-visible gap-4">
        <div className="flex flex-col gap-4 min-h-0">
          <ExportStatusOverlay
            status={exportStatus}
            error={exportError}
            setStatus={setExportStatus}
          />
          <div
            id="head"
            className="bg-midground rounded-lg p-4 overflow-visible flex flex-wrap gap-2 justify-between"
          >
            <p className="font-extrabold text-3xl my-auto text-center">
              Ticket Trigger Editor
            </p>
            <div className="grow hidden lg:block" />
            <ExportButton handleExport={handleExport} />
          </div>
        </div>
        <div
          id="general"
          className="bg-midground rounded-lg p-4 overflow-visible"
        >
          <p className="font-extrabold text-3xl">General Settings</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 my-2 gap-4">
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Trigger Label</p>
                <p className="opacity-70">The name of this trigger</p>
              </div>
              <TextInput
                value={trigger.label}
                onChange={(e) =>
                  setTrigger({ ...trigger, label: e.target.value })
                }
                className="grow"
                placeholder="New Trigger"
                max={80}
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Trigger Message</p>
                <p className="opacity-70">
                  This will be the message Threaded sends in a newly opened
                  ticket
                </p>
              </div>
              <SelectInput
                options={messages}
                value={trigger.message || undefined}
                onChange={(e) => setTrigger({ ...trigger, message: e })}
                className="grow"
                required
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">DM Message</p>
                <p className="opacity-70">
                  This message will be DMed to a user when their ticket is
                  closed. (No DM if not set)
                </p>
              </div>
              <SelectInput
                options={messages}
                value={trigger.dmOnClose || undefined}
                onChange={(e) => setTrigger({ ...trigger, dmOnClose: e })}
                className="grow"
                required
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Permission Groups</p>
                <p className="opacity-70">
                  Select groups to apply to this trigger
                </p>
              </div>
              <TagSelectInput
                onChange={(e) => setTrigger({ ...trigger, groups: e })}
                options={groups}
                selected={trigger.groups}
                className="grow"
                placeholder="Select groups"
                max={10}
              />
            </div>
          </div>
        </div>
        <div
          id="appearance"
          className="bg-midground rounded-lg p-4 overflow-visible"
        >
          <p className="font-extrabold text-3xl">Trigger Appearances</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-2 gap-4">
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Trigger Description</p>
                <p className="opacity-70">
                  If being used in a dropdown, this will add a description under
                  the label
                </p>
              </div>
              <TextInput
                value={trigger.description || ""}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    description: e.target.value || null,
                  })
                }
                className="grow"
                placeholder="Create a new ticket!"
                max={80}
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Trigger Colour</p>
                <p className="opacity-70">
                  If your trigger is being used as a button, what colour should
                  that button be?
                </p>
              </div>
              <SelectInput
                options={[
                  {
                    label: "Blurple",
                    value: "1",
                  },
                  {
                    label: "Grey",
                    value: "2",
                  },
                  {
                    label: "Green",
                    value: "3",
                  },
                  {
                    label: "Red",
                    value: "4",
                  },
                ]}
                value={`${trigger.colour}`}
                onChange={(e) =>
                  setTrigger({ ...trigger, colour: parseInt(e) })
                }
                className="grow"
                required
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Ticket Name Format</p>
                <p className="opacity-70">
                  How should the ticket name be formatted. Placeholders are
                  supported!
                </p>
              </div>
              <TextInput
                value={trigger.channelNameFormat}
                onChange={(e) =>
                  setTrigger({ ...trigger, channelNameFormat: e.target.value })
                }
                className="grow"
                placeholder="ticket-{user.username}"
                max={80}
              />
            </div>
          </div>
        </div>
        <div
          id="roles"
          className="bg-midground rounded-lg p-4 overflow-visible"
        >
          <p className="font-extrabold text-3xl">Role Settings</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-2 gap-4">
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Banned Roles</p>
                <p className="opacity-70">
                  Users with ANY of these roles cannot make a ticket
                </p>
              </div>
              <TagSelectInput
                onChange={(e) => setTrigger({ ...trigger, bannedRoles: e })}
                options={roles}
                selected={trigger.bannedRoles}
                placeholder="Add roles"
                max={15}
                className="grow"
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Required Roles</p>
                <p className="opacity-70">
                  Users must have ALL these roles to open a ticket
                </p>
              </div>
              <TagSelectInput
                onChange={(e) => setTrigger({ ...trigger, requiredRoles: e })}
                options={roles}
                selected={trigger.requiredRoles}
                placeholder="Add roles"
                max={15}
                className="grow"
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">+Roles on ticket open</p>
                <p className="opacity-70">
                  These roles will be added to a user when they use this trigger
                  to open a ticket
                </p>
              </div>
              <TagSelectInput
                options={roles}
                selected={trigger.addRolesOnOpen}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    addRolesOnOpen: e,
                  })
                }
                className="grow"
                placeholder="Select roles"
                max={15}
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">-Roles on ticket open</p>
                <p className="opacity-70">
                  These roles will be removed from a user when they use this
                  trigger to open a ticket
                </p>
              </div>
              <TagSelectInput
                options={roles}
                selected={trigger.removeRolesOnOpen}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    removeRolesOnOpen: e,
                  })
                }
                className="grow"
                placeholder="Select roles"
                max={15}
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">+Roles on ticket close</p>
                <p className="opacity-70">
                  These roles will be added to a user when a ticket made with
                  this trigger is closed
                </p>
              </div>
              <TagSelectInput
                options={roles}
                selected={trigger.addRolesOnClose}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    addRolesOnClose: e,
                  })
                }
                className="grow"
                placeholder="Select roles"
                max={15}
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">-Roles on ticket close</p>
                <p className="opacity-70">
                  These roles will be removed from a user when a ticket made
                  with this trigger is closed
                </p>
              </div>
              <TagSelectInput
                options={roles}
                selected={trigger.removeRolesOnClose}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    removeRolesOnClose: e,
                  })
                }
                className="grow"
                placeholder="Select roles"
                max={15}
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Ping Roles</p>
                <p className="opacity-70">
                  These roles will be mentioned when a ticket is opened. For
                  thread based tickets, Threaded will also ping all the group
                  roles as well
                </p>
              </div>
              <TagSelectInput
                options={roles}
                selected={trigger.notifyStaff}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    notifyStaff: e,
                  })
                }
                className="grow"
                placeholder="Select roles"
                max={15}
              />
            </div>
          </div>
        </div>
        <div
          id="channel"
          className="bg-midground rounded-lg p-4 overflow-visible"
        >
          <p className="font-extrabold text-3xl">Channel Settings</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-2 gap-4">
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Open Channel</p>
                <p className="opacity-70">
                  This channel will be where tickets are opened. Don&apos;t
                  worry about selecting the wrong type, Threaded will be able to
                  deal with it
                </p>
              </div>
              <SelectInput
                options={trigger.isThread ? textChannels : categories}
                value={trigger.openChannel || ""}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    openChannel: e || null,
                  })
                }
                className="grow"
                placeholder="Select open channel"
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Close Channel</p>
                <p className="opacity-70">
                  This channel will be where closed channel tickets are moved.
                  Don&apos;t worry about selecting the wrong type, Threaded will
                  be able to deal with it
                </p>
              </div>
              <SelectInput
                options={categories}
                value={trigger.closeChannel || ""}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    closeChannel: e || null,
                  })
                }
                className="grow"
                placeholder="Select close channel"
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Allow Raising</p>
                <p className="opacity-70">
                  Raising locks the ticket transcript to those with permission
                  to view locked transcripts
                </p>
              </div>
              <CheckboxInput
                checked={trigger.allowRaising}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    allowRaising: e,
                  })
                }
                className="grow"
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Default Raised</p>
                <p className="opacity-70">
                  For more sensitive tickets, for example giveaways, should
                  Threaded default the ticket to being raised?
                </p>
              </div>
              <CheckboxInput
                checked={trigger.defaultToRaised}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    defaultToRaised: e,
                  })
                }
                className="grow"
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Ticket Type</p>
                <p className="opacity-70">
                  The type of tickets this trigger will produce
                </p>
              </div>
              <SelectInput
                options={[
                  {
                    label: "Channel (recommended)",
                    value: "channel",
                  },
                  {
                    label: "Thread",
                    value: "thread",
                  },
                ]}
                value={trigger.isThread ? "thread" : "channel"}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    isThread: e === "thread",
                    openChannel: null,
                    closeChannel: null,
                  })
                }
                className="grow"
                required
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Allow Reopening</p>
                <p className="opacity-70">
                  Once closed, if the ticket channel has not yet been deleted,
                  should users be able to reopen it?
                </p>
              </div>
              <CheckboxInput
                checked={trigger.allowReopening}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    allowReopening: e,
                  })
                }
                className="grow"
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Allow Autoresponders</p>
                <p className="opacity-70">
                  Should auto responders be able to respond to messages in these
                  tickets?
                </p>
              </div>
              <CheckboxInput
                checked={trigger.allowAutoresponders}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    allowAutoresponders: e,
                  })
                }
                className="grow"
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Sync Channel Permissions</p>
                <p className="opacity-70">
                  Should Threaded sync the permissions of the ticket channel if
                  it is moved to a different category (will override group
                  settings, being incorrectly configured may cause issues)
                </p>
              </div>
              <CheckboxInput
                checked={trigger.syncChannelPermissionsWhenMoved}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    syncChannelPermissionsWhenMoved: e,
                  })
                }
                className="grow"
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Transfer Categories</p>
                <p className="opacity-70">
                  These categories will be available to move tickets to allowing
                  for better organization
                </p>
              </div>
              <TagSelectInput
                options={categories}
                selected={trigger.categoriesAvailableToMoveTicketsTo}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    categoriesAvailableToMoveTicketsTo: e,
                  })
                }
                max={15}
                className="grow"
                placeholder="Select channels"
              />
            </div>
          </div>
        </div>
        <div
          id="limits"
          className="bg-midground rounded-lg p-4 overflow-visible"
        >
          <p className="font-extrabold text-3xl">Limit Settings</p>
          <div className="grid grid-cols-1 md:grid-cols-2 my-2 gap-4">
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Open Tickets per User</p>
                <p className="opacity-70">
                  How many open tickets per user should Threaded allow? Does not
                  include locked tickets (0 to disable)
                </p>
              </div>
              <NumberInput
                value={trigger.userLimit}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    userLimit: e.target.valueAsNumber,
                  })
                }
                className="grow"
                min={0}
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Open Tickets</p>
                <p className="opacity-70">
                  How many tickets should Threaded allow to be open from this
                  trigger at once? (0 to disable)
                </p>
              </div>
              <NumberInput
                value={trigger.serverLimit}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    serverLimit: e.target.valueAsNumber,
                  })
                }
                className="grow"
                min={0}
              />
            </div>
          </div>
        </div>
        <div
          id="other"
          className="bg-midground rounded-lg p-4 overflow-visible"
        >
          <p className="font-extrabold text-3xl">Other Settings</p>
          <div className="grid grid-cols-1 md:grid-cols-2 my-2 gap-4">
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Save Transcripts</p>
                <p className="opacity-70">
                  If disabled, Threaded will not take transcripts of tickets
                  made with this trigger
                </p>
              </div>
              <CheckboxInput
                checked={trigger.takeTranscripts}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    takeTranscripts: e,
                  })
                }
                className="grow"
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Hide Users in Transcripts</p>
                <p className="opacity-70">
                  When enabled, Threaded will anonymise transcripts
                </p>
              </div>
              <CheckboxInput
                checked={trigger.hideUsersInTranscript}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    hideUsersInTranscript: e,
                  })
                }
                className="grow"
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">Attach Form in Tickets</p>
                <p className="opacity-70">
                  When enabled, Threaded will send a copy of the form responses
                  in the ticket (without you needing to make a message)
                </p>
              </div>
              <CheckboxInput
                checked={trigger.sendCopyOfFormInTicket}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    sendCopyOfFormInTicket: e,
                  })
                }
                className="grow"
              />
            </div>
            <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
              <div className="grow">
                <p className="text-2xl font-bold">
                  Close Tickets Automatically
                </p>
                <p className="opacity-70">
                  When enabled, Threaded will automatically close tickets of
                  users who leave the server
                </p>
              </div>
              <CheckboxInput
                checked={trigger.closeOnLeave}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    closeOnLeave: e,
                  })
                }
                className="grow"
              />
            </div>
          </div>
        </div>

        <div id="form" className="bg-midground rounded-lg p-4 overflow-visible">
          <div className="flex justify-between">
            <p className="font-extrabold text-3xl">Form Questions</p>
            <button
              onClick={() =>
                setTrigger({
                  ...trigger,
                  form: [...trigger.form, generateBlankQuestion()],
                })
              }
              disabled={trigger.form.length >= 5}
              className="my-auto px-2 py-1 bg-secondary hover:bg-secondary/90 cursor-pointer rounded-md disabled:hidden"
            >
              Add Question
            </button>
          </div>
          <div className="grid grid-cols-1 my-2 gap-4">
            {trigger.form.map((question, index) => (
              <CollapsibleSection
                key={index}
                title={`Question ${index + 1}: ${
                  question.question || "Untitled Question"
                }`}
              >
                <div className="bg-foreground z-0 relative grid grid-cols-1 gap-4 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                  {/* Question Text */}
                  <div>
                    <p className="text-xl font-bold mb-2">Question Text</p>
                    <TextInput
                      value={question.question}
                      max={45}
                      onChange={(e) => {
                        const newQuestions = [...trigger.form];
                        newQuestions[index].question = e.target.value;
                        setTrigger({
                          ...trigger,
                          form: newQuestions,
                        });
                      }}
                      placeholder="What is your opinion on foxes?"
                    />
                  </div>

                  {/* Question Type */}
                  <div>
                    <p className="text-xl font-bold mb-2">Question Type</p>
                    <SelectInput
                      value={question.multilineResponse ? "long" : "short"}
                      onChange={(e) => {
                        const newQuestions = [...trigger.form];
                        newQuestions[index].multilineResponse = e === "long";
                        setTrigger({
                          ...trigger,
                          form: newQuestions,
                        });
                      }}
                      required
                      options={[
                        { label: "Short Answer", value: "short" },
                        { label: "Long Answer", value: "long" },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xl font-bold mb-2">Prefilled value</p>
                      <TextareaInput
                        value={question.defaultValue || ""}
                        rows={1}
                        maxLength={4000}
                        onChange={(e) => {
                          const newQuestions = [...trigger.form];
                          newQuestions[index].defaultValue =
                            e.target.value || null;
                          setTrigger({
                            ...trigger,
                            form: newQuestions,
                          });
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-xl font-bold mb-2">Placeholder</p>
                      <TextareaInput
                        value={question.placeholder || ""}
                        rows={1}
                        maxLength={4000}
                        onChange={(e) => {
                          const newQuestions = [...trigger.form];
                          newQuestions[index].placeholder =
                            e.target.value || null;
                          setTrigger({
                            ...trigger,
                            form: newQuestions,
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xl font-bold mb-2">Minimum Length</p>
                      <NumberInput
                        value={question.minimumCharactersRequired || undefined}
                        onChange={(e) => {
                          const newQuestions = [...trigger.form];
                          newQuestions[index].minimumCharactersRequired =
                            e.target.valueAsNumber;
                          setTrigger({
                            ...trigger,
                            form: newQuestions,
                          });
                        }}
                        placeholder="No minimum"
                        min={0}
                        max={4000}
                      />
                    </div>
                    <div>
                      <p className="text-xl font-bold mb-2">Maximum Length</p>
                      <NumberInput
                        value={question.maximumCharactersRequired || undefined}
                        onChange={(e) => {
                          const newQuestions = [...trigger.form];
                          newQuestions[index].maximumCharactersRequired =
                            e.target.valueAsNumber;
                          setTrigger({
                            ...trigger,
                            form: newQuestions,
                          });
                        }}
                        placeholder="No maximum"
                        min={0}
                        max={4000}
                      />
                    </div>
                  </div>

                  {/* Question Actions */}
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => {
                        const newQuestions = [...trigger.form];
                        newQuestions.splice(index, 1);
                        setTrigger({
                          ...trigger,
                          form: newQuestions,
                        });
                      }}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 cursor-pointer rounded-md text-text"
                    >
                      Delete Question
                    </button>
                    <div className="flex gap-2">
                      {index > 0 && (
                        <button
                          onClick={() => {
                            const newQuestions = [...trigger.form];
                            const temp = newQuestions[index];
                            newQuestions[index] = newQuestions[index - 1];
                            newQuestions[index - 1] = temp;
                            setTrigger({
                              ...trigger,
                              form: newQuestions,
                            });
                          }}
                          className="px-2 py-1 bg-secondary/90 hover:bg-secondary cursor-pointer rounded-md text-text"
                        >
                          Move Up
                        </button>
                      )}
                      {index < trigger.form.length - 1 && (
                        <button
                          onClick={() => {
                            const newQuestions = [...trigger.form];
                            const temp = newQuestions[index];
                            newQuestions[index] = newQuestions[index + 1];
                            newQuestions[index + 1] = temp;
                            setTrigger({
                              ...trigger,
                              form: newQuestions,
                            });
                          }}
                          className="px-2 py-1 bg-secondary/90 hover:bg-secondary cursor-pointer rounded-md text"
                        >
                          Move Down
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
