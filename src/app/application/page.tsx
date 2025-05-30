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
import DateTimeInput from "@/components/inputs/DateTimeInput";

type ApplicationQuestion = {
  question: string;
  type: "number" | "text" | "choice";
  message: string | null;
  minimum: number | null;
  maximum: number | null;
  choices: string[] | null;
};

type Application = {
  questions: ApplicationQuestion[];
  name: string;
  groups: string[];
  blacklistRoles: string[];
  addRolesOnAccept: string[];
  removeRolesOnAccept: string[];
  addRolesOnReject: string[];
  removeRolesOnReject: string[];
  addRolesWhenPending: string[];
  removeRolesWhenPending: string[];
  pingRoles: string[];
  requiredRoles: string[];
  acceptingResponses: boolean;

  acceptedMessage: string | null;
  rejectedMessage: string | null;
  submissionMessage: string | null;
  confirmationMessage: string | null;
  cancelMessage: string | null;
  submissionsChannel: string | null;
  sendCopyOfApplicationInTicket: boolean;
  open: string | null;
  close: string | null;
  applicationLimit: number;
  allowedAttempts: number;
  applicationCooldown: number;
  actionOnUserLeave: "nothing" | "delete" | "approve" | "reject";
  linkedTicketTrigger: string | null;
};

const generateBlankQuestion = () => {
  return {
    question: "New Question",
    type: "text" as const,
    message: null,
    minimum: null,
    maximum: null,
    choices: null,
  };
};

export default function ApplicationPage() {
  const params = useSearchParams();
  const id = params.get("id");
  const [exportStatus, setExportStatus] = useState<
    "NULL" | "LOADING" | "SUCCESSFUL" | "ERROR"
  >("NULL");
  const [exportError, setExportError] = useState<string | null>(null);

  const [application, setApplication] = useState<Application | null>(null);

  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [messages, setMessages] = useState<{ label: string; value: string }[]>(
    []
  );
  const [channels, setChannels] = useState<{ label: string; value: string }[]>(
    []
  );
  const [ticketTriggers, setTicketTriggers] = useState<
    { label: string; value: string }[]
  >([]);
  const [groups, setGroups] = useState<{ label: string; value: string }[]>([]);

  const fetchData = async (id: string) => {
    const res = await fetch(`/api/create/application/check?id=${id}`);
    if (!res.ok) throw new Error("Failed to fetch message");
    const data = await res.json();

    if (data.data) {
      setRoles(data.data.metadata.roles);
      setChannels(data.data.metadata.channels);
      setMessages(data.data.metadata.messages);
      setTicketTriggers(data.data.metadata.ticketTriggers);
      setGroups(data.data.metadata.groups);
      if (data.data.existingApplication) {
        setApplication(data.data.existingApplication);
      } else {
        setApplication({
          name: "New Application",
          acceptedMessage: null,
          actionOnUserLeave: "nothing",
          addRolesOnAccept: [],
          addRolesOnReject: [],
          addRolesWhenPending: [],
          acceptingResponses: false,
          allowedAttempts: 1,
          applicationCooldown: 10,
          applicationLimit: 0,
          blacklistRoles: [],
          cancelMessage: null,
          close: null,
          confirmationMessage: null,
          groups: [],
          linkedTicketTrigger: null,
          open: null,
          pingRoles: [],
          questions: [],
          rejectedMessage: null,
          removeRolesOnAccept: [],
          removeRolesOnReject: [],
          removeRolesWhenPending: [],
          requiredRoles: [],
          sendCopyOfApplicationInTicket: true,
          submissionMessage: null,
          submissionsChannel: null,
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
      const exportPayload = application;

      const res = await fetch(`/api/create/application/save?id=${id}`, {
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

  if (!application)
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        {exportStatus === "NULL" && (
          <span className="text-text">Loading application editor...</span>
        )}
        {exportStatus === "ERROR" && (
          <span className="text-text">{exportError}</span>
        )}
      </div>
    );

  return (
    <main className="bg-background text-text min-h-screen">
      <div className="max-w-8xl mx-auto p-2 h-full flex flex-col overflow-visible">
        <div className="flex flex-col gap-4 min-h-0 p-4">
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
              Application Editor
            </p>
            <div className="grow hidden lg:block" />
            <ExportButton handleExport={handleExport} />
          </div>
          <div
            id="general"
            className="bg-midground rounded-lg p-4 overflow-visible"
          >
            <p className="font-extrabold text-3xl">General Settings</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 my-2 gap-4">
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Application Name</p>
                  <p className="opacity-70">The name of this application</p>
                </div>
                <TextInput
                  value={application.name}
                  onChange={(e) =>
                    setApplication({ ...application, name: e.target.value })
                  }
                  className="grow"
                  placeholder="New Application"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Submissions Channel</p>
                  <p className="opacity-70">
                    The channel that Threaded will send all the applications to
                  </p>
                </div>
                <SelectInput
                  onChange={(e) =>
                    setApplication({ ...application, submissionsChannel: e })
                  }
                  options={channels}
                  value={application.submissionsChannel || ""}
                  className="grow"
                  placeholder="Select a channel"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Ticket Trigger</p>
                  <p className="opacity-70">
                    Setting a value to this will allow tickets to be made for
                    applications
                  </p>
                </div>
                <SelectInput
                  onChange={(e) =>
                    setApplication({ ...application, linkedTicketTrigger: e })
                  }
                  options={ticketTriggers}
                  value={application.linkedTicketTrigger || ""}
                  className="grow"
                  placeholder="Select a trigger"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Permission Groups</p>
                  <p className="opacity-70">
                    Select groups to apply to this application
                  </p>
                </div>
                <TagSelectInput
                  onChange={(e) =>
                    setApplication({ ...application, groups: e })
                  }
                  options={groups}
                  selected={application.groups}
                  className="grow"
                  placeholder="Select groups"
                  max={10}
                />
              </div>
            </div>
          </div>
          <div
            id="schedule"
            className="bg-midground rounded-lg p-4 overflow-visible"
          >
            <p className="font-extrabold text-3xl">Scheduling Settings</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-2 gap-4">
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Enabled</p>
                  <p className="opacity-70">
                    Is this application currently accepting responses (overrides
                    the open/close options)
                  </p>
                </div>
                <CheckboxInput
                  checked={application.acceptingResponses}
                  onChange={(e) =>
                    setApplication({ ...application, acceptingResponses: e })
                  }
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Open Submissions</p>
                  <p className="opacity-70">
                    Set a date to automatically start accepting responses on
                  </p>
                </div>
                <DateTimeInput
                  onChange={(e) =>
                    setApplication({
                      ...application,
                      open: e.target.value !== "" ? e.target.value : null,
                    })
                  }
                  value={application.open || undefined}
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Close Submissions</p>
                  <p className="opacity-70">
                    After this date, Threaded will close this application
                    automatically
                  </p>
                </div>
                <DateTimeInput
                  onChange={(e) =>
                    setApplication({
                      ...application,
                      close: e.target.value !== "" ? e.target.value : null,
                    })
                  }
                  value={application.close || undefined}
                  className="grow"
                />
              </div>
            </div>
          </div>
          <div
            id="messages"
            className="bg-midground isolate rounded-lg p-4 overflow-visible"
          >
            <p className="font-extrabold text-3xl">Messages</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-2 gap-4 overflow-visible">
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Accepted Message</p>
                  <p className="opacity-70">
                    This message will be sent to the user if their application
                    is approved. There is a default if left blank
                  </p>
                </div>
                <SelectInput
                  onChange={(e) =>
                    setApplication({ ...application, acceptedMessage: e })
                  }
                  options={messages}
                  value={application.acceptedMessage || ""}
                  placeholder="Select a message"
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Rejected Message</p>
                  <p className="opacity-70">
                    This message will be sent to the user if their application
                    is rejected. There is a default if left blank
                  </p>
                </div>
                <SelectInput
                  onChange={(e) =>
                    setApplication({ ...application, rejectedMessage: e })
                  }
                  options={messages}
                  value={application.rejectedMessage || ""}
                  placeholder="Select a message"
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Submission Message</p>
                  <p className="opacity-70">
                    This message will be sent to the user when they submit this
                    application. There is a default if left blank
                  </p>
                </div>
                <SelectInput
                  onChange={(e) =>
                    setApplication({ ...application, submissionMessage: e })
                  }
                  options={messages}
                  value={application.submissionMessage || ""}
                  placeholder="Select a message"
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Confirmation Message</p>
                  <p className="opacity-70">
                    This message will be sent to the user to confirm they want
                    to take this application. There is a default if left blank
                  </p>
                </div>
                <SelectInput
                  onChange={(e) =>
                    setApplication({ ...application, confirmationMessage: e })
                  }
                  options={messages}
                  value={application.confirmationMessage || ""}
                  placeholder="Select a message"
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Cancel Message</p>
                  <p className="opacity-70">
                    This message will be sent to the user if they cancel taking
                    the application. There is a default if left blank
                  </p>
                </div>
                <SelectInput
                  onChange={(e) =>
                    setApplication({ ...application, cancelMessage: e })
                  }
                  options={messages}
                  value={application.cancelMessage || ""}
                  placeholder="Select a message"
                  className="grow"
                />
              </div>
            </div>
          </div>
          <div
            id="roles"
            className="bg-midground isolate rounded-lg p-4 overflow-visible"
          >
            <p className="font-extrabold text-3xl">Roles</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-2 gap-4 overflow-visible">
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Banned Roles</p>
                  <p className="opacity-70">
                    Users with ANY of these roles cannot apply
                  </p>
                </div>
                <TagSelectInput
                  onChange={(e) =>
                    setApplication({ ...application, blacklistRoles: e })
                  }
                  options={roles}
                  selected={application.blacklistRoles}
                  placeholder="Add roles"
                  max={15}
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Required Roles</p>
                  <p className="opacity-70">
                    Users must have ALL these roles to apply
                  </p>
                </div>
                <TagSelectInput
                  onChange={(e) =>
                    setApplication({ ...application, requiredRoles: e })
                  }
                  options={roles}
                  selected={application.requiredRoles}
                  placeholder="Add roles"
                  max={15}
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Ping Roles</p>
                  <p className="opacity-70">
                    These roles will be mentioned when there is a new
                    application
                  </p>
                </div>
                <TagSelectInput
                  onChange={(e) =>
                    setApplication({ ...application, pingRoles: e })
                  }
                  options={roles}
                  selected={application.pingRoles}
                  placeholder="Add roles"
                  max={15}
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Approved +Roles</p>
                  <p className="opacity-70">
                    These roles will be given to a user if their application
                    gets approved
                  </p>
                </div>
                <TagSelectInput
                  onChange={(e) =>
                    setApplication({ ...application, addRolesOnAccept: e })
                  }
                  options={roles}
                  selected={application.addRolesOnAccept}
                  placeholder="Add roles"
                  max={15}
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Pending +Roles</p>
                  <p className="opacity-70">
                    These roles will be given to a user when they submit an
                    application
                  </p>
                </div>
                <TagSelectInput
                  onChange={(e) =>
                    setApplication({ ...application, addRolesWhenPending: e })
                  }
                  options={roles}
                  selected={application.addRolesWhenPending}
                  placeholder="Add roles"
                  max={15}
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Rejected +Roles</p>
                  <p className="opacity-70">
                    These roles will be given to a user if their application is
                    rejected
                  </p>
                </div>
                <TagSelectInput
                  onChange={(e) =>
                    setApplication({ ...application, addRolesOnReject: e })
                  }
                  options={roles}
                  selected={application.addRolesOnReject}
                  placeholder="Add roles"
                  max={15}
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Approved -Roles</p>
                  <p className="opacity-70">
                    These roles will be removed from a user if their application
                    gets approved
                  </p>
                </div>
                <TagSelectInput
                  onChange={(e) =>
                    setApplication({ ...application, removeRolesOnAccept: e })
                  }
                  options={roles}
                  selected={application.removeRolesOnAccept}
                  placeholder="Add roles"
                  max={15}
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Pending -Roles</p>
                  <p className="opacity-70">
                    These roles will be removed from a user when they submit an
                    application
                  </p>
                </div>
                <TagSelectInput
                  onChange={(e) =>
                    setApplication({
                      ...application,
                      removeRolesWhenPending: e,
                    })
                  }
                  options={roles}
                  selected={application.removeRolesWhenPending}
                  placeholder="Add roles"
                  max={15}
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Rejected -Roles</p>
                  <p className="opacity-70">
                    These roles will be removed from a user if their application
                    gets rejected
                  </p>
                </div>
                <TagSelectInput
                  onChange={(e) =>
                    setApplication({ ...application, removeRolesOnReject: e })
                  }
                  options={roles}
                  selected={application.removeRolesOnReject}
                  placeholder="Add roles"
                  max={15}
                  className="grow"
                />
              </div>
            </div>
          </div>
          <div
            id="limits"
            className="bg-midground rounded-lg p-4 overflow-visible"
          >
            <p className="font-extrabold text-3xl">Limits</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-2 gap-4">
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Application Limit</p>
                  <p className="opacity-70">
                    How many applications do you want to accept. Once this
                    number is reached Threaded will stop accepting responses.
                    Set to 0 to disable
                  </p>
                </div>
                <NumberInput
                  value={application.applicationLimit}
                  onChange={(e) =>
                    setApplication({
                      ...application,
                      applicationLimit: Math.max(e.target.valueAsNumber, 0),
                    })
                  }
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Allowed Attempts</p>
                  <p className="opacity-70">
                    How many times can a user attempt this application (deleted
                    applications do not count towards this limit). Set to 0 to
                    disable
                  </p>
                </div>
                <NumberInput
                  value={application.allowedAttempts}
                  onChange={(e) =>
                    setApplication({
                      ...application,
                      allowedAttempts: Math.max(e.target.valueAsNumber, 0),
                    })
                  }
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Cooldown</p>
                  <p className="opacity-70">
                    How many minutes does a user have to wait between getting an
                    application verdict and reapplying? Set to 0 to disable
                  </p>
                </div>
                <NumberInput
                  value={application.applicationCooldown}
                  onChange={(e) =>
                    setApplication({
                      ...application,
                      applicationCooldown: Math.max(e.target.valueAsNumber, 0),
                    })
                  }
                  className="grow"
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
                  <p className="text-2xl font-bold">
                    Send application copy in tickets
                  </p>
                  <p className="opacity-70">
                    If a ticket is created for a user, should Threaded also
                    include a copy of their application?
                  </p>
                </div>
                <CheckboxInput
                  checked={application.sendCopyOfApplicationInTicket}
                  onChange={(e) =>
                    setApplication({
                      ...application,
                      sendCopyOfApplicationInTicket: e,
                    })
                  }
                  className="grow"
                />
              </div>
              <div className="bg-foreground z-0 relative grid grid-rows-2 grid-cols-1 min-h-40 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">
                    Action when user leaves server
                  </p>
                  <p className="opacity-70">
                    What should Threaded do if a user leaves the server with a
                    pending application?
                  </p>
                </div>
                <SelectInput
                  value={application.actionOnUserLeave}
                  required
                  onChange={(e) =>
                    setApplication({
                      ...application,
                      actionOnUserLeave: e as
                        | "nothing"
                        | "approve"
                        | "reject"
                        | "delete",
                    })
                  }
                  className="grow"
                  options={[
                    { label: "Do nothing", value: "nothing" },
                    { label: "Reject the application", value: "reject" },
                    { label: "Approve the application", value: "approve" },
                    { label: "Delete the application", value: "delete" },
                  ]}
                />
              </div>
            </div>
          </div>
          <div
            id="questions"
            className="bg-midground rounded-lg p-4 overflow-visible"
          >
            <div className="flex justify-between">
              <p className="font-extrabold text-3xl">Questions</p>
              <button
                onClick={() =>
                  setApplication({
                    ...application,
                    questions: [
                      ...application.questions,
                      generateBlankQuestion(),
                    ],
                  })
                }
                disabled={application.questions.length >= 50}
                className="my-auto px-2 py-1 bg-secondary hover:bg-secondary/90 cursor-pointer rounded-md disabled:hidden"
              >
                Add Question
              </button>
            </div>
            <div className="grid grid-cols-1 my-2 gap-4">
              {application.questions.map((question, index) => (
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
                        max={500}
                        onChange={(e) => {
                          const newQuestions = [...application.questions];
                          newQuestions[index].question = e.target.value;
                          setApplication({
                            ...application,
                            questions: newQuestions,
                          });
                        }}
                        placeholder="What is your opinion on foxes?"
                      />
                    </div>

                    {/* Question Type */}
                    <div>
                      <p className="text-xl font-bold mb-2">Question Type</p>
                      <SelectInput
                        value={question.type}
                        onChange={(e) => {
                          const newQuestions = [...application.questions];
                          newQuestions[index].type = e as
                            | "text"
                            | "number"
                            | "choice";
                          // Reset type-specific fields when changing type
                          if (e !== "choice")
                            newQuestions[index].choices = null;
                          setApplication({
                            ...application,
                            questions: newQuestions,
                          });
                        }}
                        required
                        options={[
                          { label: "Text Answer", value: "text" },
                          { label: "Number Answer", value: "number" },
                          { label: "Multiple Choice", value: "choice" },
                        ]}
                      />
                    </div>

                    <div>
                      <p className="text-xl font-bold mb-2">
                        Message (There is a default if left blank)
                      </p>
                      <SelectInput
                        options={messages}
                        value={question.message || undefined}
                        onChange={(e) => {
                          const newQuestions = [...application.questions];
                          newQuestions[index].message = e || null;
                          setApplication({
                            ...application,
                            questions: newQuestions,
                          });
                        }}
                        placeholder="Select a message"
                      />
                    </div>

                    {/* Type-specific fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xl font-bold mb-2">
                          Minimum{" "}
                          {question.type === "number"
                            ? "Value"
                            : question.type === "choice"
                            ? "Selection"
                            : "Length"}{" "}
                          (Optional)
                        </p>
                        <NumberInput
                          value={question.minimum || undefined}
                          onChange={(e) => {
                            const newQuestions = [...application.questions];
                            newQuestions[index].minimum =
                              e.target.valueAsNumber;
                            setApplication({
                              ...application,
                              questions: newQuestions,
                            });
                          }}
                          placeholder="No minimum"
                        />
                      </div>
                      <div>
                        <p className="text-xl font-bold mb-2">
                          Maximum{" "}
                          {question.type === "number"
                            ? "Value"
                            : question.type === "choice"
                            ? "Selection"
                            : "Length"}{" "}
                          (Optional)
                        </p>
                        <NumberInput
                          value={question.maximum || undefined}
                          onChange={(e) => {
                            const newQuestions = [...application.questions];
                            newQuestions[index].maximum =
                              e.target.valueAsNumber;
                            setApplication({
                              ...application,
                              questions: newQuestions,
                            });
                          }}
                          placeholder="No maximum"
                        />
                      </div>
                    </div>

                    {question.type === "choice" && (
                      <div>
                        <p className="text-xl font-bold mb-2">Answer Choices</p>
                        <div className="flex flex-col gap-2">
                          {question.choices?.map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="flex gap-2">
                              <TextInput
                                value={choice}
                                max={100}
                                onChange={(e) => {
                                  const newQuestions = [
                                    ...application.questions,
                                  ];
                                  if (!newQuestions[index].choices) {
                                    newQuestions[index].choices = [];
                                  }
                                  newQuestions[index].choices![choiceIndex] =
                                    e.target.value;
                                  setApplication({
                                    ...application,
                                    questions: newQuestions,
                                  });
                                }}
                                placeholder={`Option ${choiceIndex + 1}`}
                              />
                              <button
                                onClick={() => {
                                  const newQuestions = [
                                    ...application.questions,
                                  ];
                                  if (newQuestions[index].choices) {
                                    newQuestions[index].choices = newQuestions[
                                      index
                                    ].choices!.filter(
                                      (_, i) => i !== choiceIndex
                                    );
                                    setApplication({
                                      ...application,
                                      questions: newQuestions,
                                    });
                                  }
                                }}
                                className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded-md text"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newQuestions = [...application.questions];
                              if (!newQuestions[index].choices) {
                                newQuestions[index].choices = [];
                              }
                              newQuestions[index].choices!.push("");
                              setApplication({
                                ...application,
                                questions: newQuestions,
                              });
                            }}
                            disabled={
                              (application.questions[index].choices &&
                                application.questions[index].choices.length >=
                                  25) ||
                              false
                            }
                            className="mt-2 px-2 py-1 bg-secondary hover:bg-secondary/90 rounded-md disabled:hidden"
                          >
                            Add Choice
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Question Actions */}
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => {
                          const newQuestions = [...application.questions];
                          newQuestions.splice(index, 1);
                          setApplication({
                            ...application,
                            questions: newQuestions,
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
                              const newQuestions = [...application.questions];
                              const temp = newQuestions[index];
                              newQuestions[index] = newQuestions[index - 1];
                              newQuestions[index - 1] = temp;
                              setApplication({
                                ...application,
                                questions: newQuestions,
                              });
                            }}
                            className="px-2 py-1 bg-secondary/90 hover:bg-secondary cursor-pointer rounded-md text-text"
                          >
                            Move Up
                          </button>
                        )}
                        {index < application.questions.length - 1 && (
                          <button
                            onClick={() => {
                              const newQuestions = [...application.questions];
                              const temp = newQuestions[index];
                              newQuestions[index] = newQuestions[index + 1];
                              newQuestions[index + 1] = temp;
                              setApplication({
                                ...application,
                                questions: newQuestions,
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
      </div>
    </main>
  );
}
