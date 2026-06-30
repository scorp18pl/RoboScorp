const DISCORD_MESSAGE_LIMIT = 2000;
const CODEBLOCK_FENCE_LENGTH = '```\n'.length + '\n```'.length;
const MAX_TABLE_LENGTH = DISCORD_MESSAGE_LIMIT - CODEBLOCK_FENCE_LENGTH;

const NO_WAYPOINTS_MESSAGE = 'No publicly shared waypoints available.';

const COLUMNS = ['owner', 'name', 'world', 'coords'];
const HEADERS = ['Owner', 'Name', 'World', '(x, y, z)'];

function getDateString() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function parseWaypointsCsv(csv) {
  const [, ...rows] = csv.split('\n').filter((line) => line.length > 0);
  return rows.map((row) => {
    const [owner, name, world, x, y, z] = row.split(',');
    return { owner, name, world, x, y, z };
  });
}

// Mirrors the table's previous merged-cell look: blank out an Owner/World
// cell when it repeats the value directly above it.
function collapseRepeatedColumns(waypoints) {
  let lastOwner = '';
  let lastWorld = '';
  return waypoints.map((waypoint) => {
    const row = {
      owner: waypoint.owner === lastOwner ? '' : waypoint.owner,
      name: waypoint.name,
      world: waypoint.world === lastWorld ? '' : waypoint.world,
      coords: `(${waypoint.x}, ${waypoint.y}, ${waypoint.z})`,
    };
    lastOwner = waypoint.owner;
    lastWorld = waypoint.world;
    return row;
  });
}

function buildTableLines(rows) {
  const widths = COLUMNS.map((column, i) => Math.max(HEADERS[i].length, ...rows.map((row) => row[column].length)));
  const buildSeparator = () => `+${widths.map((width) => '-'.repeat(width + 2)).join('+')}+`;
  const buildRow = (cells) => `| ${cells.map((cell, i) => cell.padEnd(widths[i])).join(' | ')} |`;

  const separator = buildSeparator();
  const headerLines = [separator, buildRow(HEADERS), separator];
  const dataLines = rows.map((row) => buildRow(COLUMNS.map((column) => row[column])));

  return { headerLines, dataLines, separator };
}

// Packs the table into as few codeblocks as fit Discord's message length
// limit, repeating the header in every continuation block.
function packIntoCodeblocks(headerLines, dataLines, separator, titleLine) {
  const chunks = [];
  let current = [titleLine, ...headerLines];
  let hasRows = false;

  dataLines.forEach((dataLine) => {
    const candidateLength = [...current, dataLine, separator].join('\n').length;
    if (hasRows && candidateLength > MAX_TABLE_LENGTH) {
      chunks.push([...current, separator].join('\n'));
      current = [...headerLines];
      hasRows = false;
    }
    current.push(dataLine);
    hasRows = true;
  });

  chunks.push([...current, separator].join('\n'));
  return chunks.map((chunk) => `\`\`\`\n${chunk}\n\`\`\``);
}

function buildCoordsMessages(csv) {
  const waypoints = parseWaypointsCsv(csv);
  if (waypoints.length === 0) {
    return [`\`\`\`\n${NO_WAYPOINTS_MESSAGE}\n\`\`\``];
  }

  const rows = collapseRepeatedColumns(waypoints);
  const { headerLines, dataLines, separator } = buildTableLines(rows);
  const titleLine = `Publicly shared waypoints (updated: ${getDateString()})`;

  return packIntoCodeblocks(headerLines, dataLines, separator, titleLine);
}

module.exports = { buildCoordsMessages };
