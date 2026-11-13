import type { ReactNode } from 'react';

type MarkdownContentProps = {
  content: string;
  className?: string;
};

function renderInline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)]+\))/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[0.9em]">{part.slice(1, -1)}</code>;
    }
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2">{link[1]}</a>;
    }
    return part;
  });
}

function isUnorderedList(line: string) {
  return /^\s*[-*+]\s+/.test(line);
}

function isOrderedList(line: string) {
  return /^\s*\d+[.)]\s+/.test(line);
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const lines = content.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1].length, 4);
      const HeadingTag = `h${level + 1}` as keyof JSX.IntrinsicElements;
      blocks.push(
        <HeadingTag key={index} className="mb-2 mt-5 font-extrabold leading-tight first:mt-0">
          {renderInline(heading[2])}
        </HeadingTag>
      );
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      index += 1;
      const codeLines: string[] = [];
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(
        <pre key={index} className="overflow-x-auto rounded border border-ink/15 bg-ink/5 p-3 text-sm">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    if (isUnorderedList(line) || isOrderedList(line)) {
      const ordered = isOrderedList(line);
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        if (ordered ? !isOrderedList(current) : !isUnorderedList(current)) break;
        items.push(current.replace(ordered ? /^\d+[.)]\s+/ : /^[-*+]\s+/, ''));
        index += 1;
      }
      const ListTag = ordered ? 'ol' : 'ul';
      blocks.push(
        <ListTag key={index} className={`list-inside ${ordered ? 'list-decimal' : 'list-disc'} space-y-1 pl-1`}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
        </ListTag>
      );
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,6}\s+/.test(lines[index].trim()) &&
      !isUnorderedList(lines[index]) &&
      !isOrderedList(lines[index]) &&
      !lines[index].trim().startsWith('```')
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(
      <p key={index} className="leading-[1.6]">
        {renderInline(paragraph.join(' '))}
      </p>
    );
  }

  return <div className={`space-y-3 ${className}`}>{blocks}</div>;
}
