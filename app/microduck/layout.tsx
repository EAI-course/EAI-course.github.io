import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Microduck A to Z · Assembly & joints',
  description: 'Explore the released Microduck robot assembly, reveal its components, and learn how joint angles move connected parts. An interactive embodied AI course lab.',
};

export default function LabLayout({children}:{children:React.ReactNode}) { return children; }
