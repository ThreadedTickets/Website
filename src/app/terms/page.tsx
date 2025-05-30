export default function TermsPage() {
  return (
    <main className="mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service for Threaded</h1>

      <Section title="1. Overview">
        <p>
          <strong>Threaded</strong> is a Discord bot designed to streamline
          community support. It includes features such as:
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>Ticketing – open and manage private support threads</li>
          <li>Applications – create and manage application forms</li>
          <li>Auto Responders – send automatic replies to common questions</li>
          <li>Tags – send quick replies to common questions</li>
        </ul>
        <p className="mt-2">
          Threaded is provided as-is, without warranty or guarantee of uptime or
          future support.
        </p>
      </Section>

      <Section title="2. Usage">
        <p>To use Threaded you:</p>
        <ul className="list-disc list-inside mt-2">
          <li>
            Are at least 13 years old, or meet the minimum age required by
            Discord’s Terms of Service.
          </li>
          <li>
            Are authorized to invite and configure bots on the servers where
            Threaded is used.
          </li>
          <li>
            Will not misuse the bot for harassment, spam, or other malicious
            purposes.
          </li>
        </ul>
        <p className="mt-2">
          We reserve the right to block access to users or servers that violate
          these terms or abuse the bot’s features.
        </p>
      </Section>

      <Section title="3. Data Collection">
        <p>
          To provide its features, <strong>Threaded</strong> stores the
          following:
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>
            <strong>Server Data</strong>: Server IDs, channel IDs, role IDs, and
            message IDs used for configuration.
          </li>
          <li>
            <strong>Configuration Data</strong>: All settings and preferences
            set by server admins.
          </li>
          <li>
            <strong>User Data</strong>: User IDs, and answers submitted via DMs
            as part of applications.
          </li>
        </ul>
        <p className="mt-2">
          We <strong>do not</strong> store general DMs or collect sensitive
          personal data (e.g., passwords, emails).
        </p>
        <p className="mt-2">
          All data is used strictly to operate the bot and is never shared or
          sold, unless required by law.
        </p>
      </Section>

      <Section title="4. Data Retention and Deletion">
        <p>
          We retain data only as long as necessary to operate the bot or until
          you request its removal.
        </p>
        <p className="mt-2">
          <strong>Server Owners:</strong> You may request complete data deletion
          by contacting support.
        </p>
        <p className="mt-2">
          <strong>Users:</strong> If you’ve submitted an application and want
          your responses removed, please contact the server where it was
          submitted. We’ll honor requests verified by the server admin.
        </p>
      </Section>

      <Section title="5. Limitation of Liability">
        <p>
          Threaded is offered “as-is.” We are not liable for data loss, service
          disruptions, or misuse of the bot. Use is at your own risk.
        </p>
      </Section>

      <Section title="6. Changes to These Terms">
        <p>
          These terms may be updated at any time. Significant changes will be
          posted in the support server. Continued use implies acceptance of the
          latest terms.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          For support or data deletion requests, please contact us at:
          <br />
          <strong>Support Server:</strong>{" "}
          <a
            href="https://discord.gg/9jFqS5H43Q"
            className="text-accent underline"
          >
            discord.gg/9jFqS5H43Q
          </a>
        </p>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {children}
    </section>
  );
}
