
import type { Node } from '../types';

export function exportNodesToJSON(nodes: Node[], filename: string = 'subqg_nodes.json'): void {
  if (nodes.length === 0) {
    alert("No node data to export.");
    return;
  }
  const jsonString = JSON.stringify(nodes, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportNodesToCSV(nodes: Node[], filename: string = 'subqg_nodes.csv'): void {
  if (nodes.length === 0) {
    alert("No node data to export.");
    return;
  }
  const header = 'tick,interferenceValue\n';
  const csvRows = nodes.map(node => `${node.tick},${node.interferenceValue.toFixed(5)}`);
  const csvString = header + csvRows.join('\n');
  
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadMarkdownReport(
    content: string,
    filename: string = 'subqg_simulation_report.md'
): void {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
