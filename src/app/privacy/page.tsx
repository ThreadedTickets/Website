export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy for Threaded</h1>

      <Section title="1. Introduction">
        <p>
          Threaded is a Discord bot that helps server administrators manage
          support via tickets, applications, and automated responses. This
          Privacy Policy explains what data we collect, how we use it, and your
          rights regarding your information.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p>
          We collect and store limited information required to operate the bot:
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>
            <strong>Server Configuration:</strong> Server, channel, role, and
            message IDs for bot setup and commands.
          </li>
          <li>
            <strong>Bot Settings:</strong> Any configuration settings provided
            by server admins (e.g., ticket categories, questions).
          </li>
          <li>
            <strong>User Data:</strong> User IDs for managing tickets and
            applications.
          </li>
          <li>
            <strong>Application Responses:</strong> Only answers submitted via
            DM as part of an application process.
          </li>
        </ul>
        <p className="mt-2">
          We do <strong>not</strong> collect:
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>General direct messages outside of the application process</li>
          <li>Emails, passwords, IP addresses, or payment information</li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Data">
        <p>
          Your data is used solely to provide the intended functionality of
          Threaded, including:
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>Managing ticket systems</li>
          <li>Handling user-submitted applications</li>
          <li>Automating server-specific responses</li>
          <li>Moderating the bot</li>
        </ul>
        <p className="mt-2">
          We do not sell, share, or monetize your data in any way.
        </p>
      </Section>

      <Section title="4. Data Retention">
        <p>
          We retain collected data only as long as necessary to provide our
          services, or until deletion is requested.
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>
            <strong>Server Admins</strong> can request complete data removal for
            their server.
          </li>
          <li>
            <strong>Users</strong> can request removal of their application data
            via the server where it was submitted.
          </li>
        </ul>
      </Section>

      <Section title="5. Data Sharing">
        <p>
          We do not share your data with third parties. The only exception is if
          we are legally required to comply with law enforcement or court
          orders.
        </p>
      </Section>

      <Section title="6. Your Rights">
        <p>You have the following rights:</p>
        <ul className="list-disc list-inside mt-2">
          <li>The right to access the data we store about you</li>
          <li>The right to request data correction or deletion</li>
          <li>The right to withdraw consent (if applicable)</li>
        </ul>
        <p className="mt-2">Contact us below to exercise these rights.</p>
      </Section>

      <Section title="7. Changes to This Policy">
        <p>
          This Privacy Policy may be updated from time to time. Material changes
          will be announced in the official support server. Continued use of the
          bot implies acceptance of the updated policy.
        </p>
      </Section>

      <Section title="8. Contact">
        <p>
          For questions, concerns, or data removal requests, contact us at:
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
