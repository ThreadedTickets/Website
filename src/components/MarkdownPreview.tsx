import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const Mention = ({
  type,
  id,
  roles,
  channels,
}: {
  type: any;
  id: any;
  roles?: { name: string; id: string; colour: string }[];
  channels?: { name: string; id: string; type: number }[];
}) => {
  const baseStyles =
    "px-[3px] py-[1px] rounded mx-0.5 bg-blue-500/10 text-blue-400 hover:bg-blue-300/20 cursor-pointer";

  // Find the mentioned item if available
  const mentionedRole = roles?.find((role) => role.id === id);
  const mentionedChannel = channels?.find((channel) => channel.id === id);

  // Handle different mention types with actual names if available
  let content;
  switch (type) {
    case "user":
      content = "@user";
      break;
    case "role":
      content = mentionedRole ? `@${mentionedRole.name}` : "@role";
      break;
    case "channel":
      content = mentionedChannel ? `#${mentionedChannel.name}` : "#channel";
      break;
    case "everyone":
      content = "@everyone";
      break;
    case "here":
      content = "@here";
      break;
    default:
      content = "@unknown";
  }

  // Get color if it's a role and available
  const color =
    type === "role" && mentionedRole ? mentionedRole.colour : undefined;

  return (
    <span
      className={`${baseStyles} ${
        ["everyone", "here"].includes(type) ? "font-semibold" : ""
      }`}
      style={color ? { color } : undefined}
    >
      {content}
    </span>
  );
};

export default function MarkdownPreview({
  content,
  roles,
  channels,
}: {
  content: any;
  roles?: { name: string; id: string; colour: string }[];
  channels?: { name: string; id: string; type: number }[];
}) {
  if (!content) return null;

  // First convert all mention formats to a temporary marker
  const processedContent = content
    // Convert Discord native mentions
    .replace(/<@!?(\d+)>/g, "[USER_MENTION]($1)")
    .replace(/<@&(\d+)>/g, "[ROLE_MENTION]($1)")
    .replace(/<#(\d+)>/g, "[CHANNEL_MENTION]($1)")
    .replace(/@everyone/g, "[EVERYONE_MENTION]()")
    .replace(/@here/g, "[HERE_MENTION]()");

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        small: ({ ...props }) => (
          <span className="text-xs opacity-80 text-green-300" {...props} />
        ),
        // Handle all mention types
        a: ({ href, children }) => {
          if (children === "USER_MENTION")
            return (
              <Mention
                id={href}
                type="user"
                roles={roles}
                channels={channels}
              />
            );
          if (children === "ROLE_MENTION")
            return (
              <Mention
                id={href}
                type="role"
                roles={roles}
                channels={channels}
              />
            );
          if (children === "CHANNEL_MENTION")
            return (
              <Mention
                id={href}
                type="channel"
                roles={roles}
                channels={channels}
              />
            );
          if (children === "EVERYONE_MENTION")
            return (
              <Mention
                id={href}
                type="everyone"
                roles={roles}
                channels={channels}
              />
            );
          if (children === "HERE_MENTION")
            return (
              <Mention
                id={href}
                type="here"
                roles={roles}
                channels={channels}
              />
            );

          return (
            <a
              href={href}
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );
        },
        // Headers
        h1: ({ ...props }) => (
          <h1 className="text-2xl font-bold my-4" {...props} />
        ),
        h2: ({ ...props }) => (
          <h2 className="text-xl font-bold my-3" {...props} />
        ),
        h3: ({ ...props }) => (
          <h3 className="text-lg font-bold my-2" {...props} />
        ),
        // Blockquotes (> text)
        blockquote: ({ ...props }) => (
          <blockquote
            className="border-l-4 border-gray-500 pl-4 my-2 text-gray-300 italic"
            {...props}
          />
        ),
        // Lists
        ul: ({ ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
        ol: ({ ...props }) => (
          <ol className="list-decimal pl-5 my-2" {...props} />
        ),
        li: ({ ...props }) => <li className="my-1" {...props} />,
        // Code blocks
        code: ({ ...props }) => (
          <code
            {...props}
            className={`block bg-gray-800 p-3 rounded my-2 font-mono text-sm`}
          />
        ),
        // Horizontal rule
        hr: ({ ...props }) => (
          <hr className="border-t border-gray-700 my-4" {...props} />
        ),
        // Paragraphs
        p: ({ ...props }) => (
          <p className="my-2 whitespace-pre-wrap" {...props} />
        ),
        // Strong/bold
        strong: ({ ...props }) => <strong className="font-bold" {...props} />,
        // Emphasis/italic
        em: ({ ...props }) => <em className="" {...props} />,
        // Strikethrough
        del: ({ ...props }) => <del className="line-through" {...props} />,
      }}
      remarkRehypeOptions={{ clobberPrefix: "" }}
      urlTransform={null}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
