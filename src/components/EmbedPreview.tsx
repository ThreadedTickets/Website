import MarkdownPreview from "./MarkdownPreview";

export default function EmbedPreview({
  embed,
  channels,
  roles,
}: {
  embed: any;
  channels: any;
  roles: any;
}) {
  if (!embed.title && !embed.description && embed.fields.length === 0)
    return null;

  const embedColor = embed.color || "#5865F2";

  const formatTimestamp = (isoString: string) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
      new Date(date.getTime() + 86400000).toDateString() === now.toDateString();
    const isThisYear = date.getFullYear() === now.getFullYear();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (isThisYear) {
      return `${date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })} at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return `${date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  };

  return (
    <div className="mt-2 max-w-[520px]">
      <div
        className="border-l-4 p-3 rounded bg-[#3f4144]"
        style={{ borderColor: embedColor }}
      >
        {/* Author */}
        {embed.author?.name && (
          <div className="flex items-center mb-2">
            {embed.author.icon_url && (
              <img
                src={embed.author.icon_url}
                alt="Author icon"
                className="w-5 h-5 rounded-full mr-2"
              />
            )}
            {embed.author.url ? (
              <a
                href={embed.author.url}
                className="text-text font-semibold hover:underline text-sm"
              >
                {embed.author.name}
              </a>
            ) : (
              <span className="text-text font-semibold text-sm">
                {embed.author.name}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        {embed.title && embed.url && (
          <h3 className="font-bold text-blue-400 text-sm mb-1 hover:underline">
            <a href={embed.url}>{embed.title}</a>
          </h3>
        )}
        {embed.title && !embed.url && (
          <h3 className="font-bold text-text text-sm mb-1">{embed.title}</h3>
        )}

        {/* Description */}
        {embed.description && (
          <div className="mb-2 text-text text-sm">
            <MarkdownPreview
              content={embed.description}
              channels={channels}
              roles={roles}
            />{" "}
          </div>
        )}

        {/* Fields */}
        {embed.fields.length > 0 && (
          <div
            className={`grid gap-2 mb-2 ${
              embed.fields.some((f: any) => f.inline)
                ? "grid-cols-1 md:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {embed.fields.map((field: any, i: number) => (
              <div key={i} className={`${field.inline ? "" : "col-span-2"}`}>
                <div className="font-bold text-text text-xs mb-0.5">
                  {field.name}
                </div>
                <div className="text-text text-sm">
                  <MarkdownPreview
                    content={field.value}
                    channels={channels}
                    roles={roles}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Thumbnail */}
        {embed.thumbnail?.url && (
          <div className="float-right ml-3 mb-2">
            <img
              src={embed.thumbnail.url}
              alt="Thumbnail"
              className="max-w-[80px] max-h-[80px] rounded"
            />
          </div>
        )}

        {/* Footer & Timestamp */}
        {(embed.footer?.text || embed.timestamp) && (
          <div className="flex items-center text-xs text-gray-400 mt-2">
            {embed.footer?.icon_url && (
              <img
                src={embed.footer.icon_url}
                alt="Footer icon"
                className="w-4 h-4 rounded-full mr-1"
              />
            )}
            <span>
              {embed.footer?.text}
              {embed.footer?.text && embed.timestamp && " • "}
              {embed.timestamp && formatTimestamp(embed.timestamp)}
            </span>
          </div>
        )}

        {/* Image */}
        {embed.image?.url && (
          <div className="mt-2 rounded overflow-hidden">
            <img
              src={embed.image.url}
              alt="Embed image"
              className="max-w-full max-h-80 object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
