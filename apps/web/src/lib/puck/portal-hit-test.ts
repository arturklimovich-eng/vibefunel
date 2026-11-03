export const PUCK_HOST_ATTR = 'data-puck-host';

export function installPortalHitTest(): () => void {
  const original = document.elementsFromPoint.bind(document);
  const patched = (x: number, y: number): Element[] => {
    const elements = original(x, y);
    if (!elements.some((el) => el.closest(`[${PUCK_HOST_ATTR}]`))) return elements;
    const root = document.querySelector('div.Puck[id]');
    return root && !elements.includes(root) ? [...elements, root] : elements;
  };
  document.elementsFromPoint = patched;
  return () => {
    if (document.elementsFromPoint === patched) document.elementsFromPoint = original;
  };
}
