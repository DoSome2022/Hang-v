import { ImageResponse } from 'next/og';

export const alt = 'HANGS Technology — AI solutions, human possibilities';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7faf6', padding: '70px', color: '#162144', fontFamily: 'sans-serif' }}><div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: 29, letterSpacing: '5px' }}><div style={{ width: 45, height: 45, borderRadius: 12, background: '#009c6f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', letterSpacing: 0, fontWeight: 800 }}>H</div>HANGS TECHNOLOGY</div><div style={{ display: 'flex', flexDirection: 'column', fontSize: 83, fontWeight: 700, letterSpacing: '-4px', lineHeight: 1.13 }}><span>Intelligent technology.</span><span style={{ color: '#008c64' }}>Human possibilities.</span></div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, color: '#54616a' }}><span>AI · AUTOMATION · CLOUD · DIGITAL PLATFORMS</span><span>EST. 2023 / HONG KONG</span></div></div>, size);
}
