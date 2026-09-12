import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Microduck A to Z · From body to behavior',
  description: 'Learn how the real Microduck system connects mechanics, hardware, software, walking, simulation, and local model evaluation.',
};

export default function LabLayout({children}:{children:React.ReactNode}) { return children; }
