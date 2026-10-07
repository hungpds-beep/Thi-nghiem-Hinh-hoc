/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { TabType } from './types/geometry';
import { Navbar } from './components/Navbar';
import { Panel2D } from './components/Panel2D';
import { Panel3D } from './components/Panel3D';
import { PanelFreeDraw } from './components/PanelFreeDraw';
import { downloadSingleFileHTML } from './utils/singleFileExport';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('2d');

  // Canvas refs for each tab to enable crisp PNG export
  const canvas2DRef = useRef<HTMLCanvasElement | null>(null);
  const canvas3DRef = useRef<HTMLCanvasElement | null>(null);
  const canvasFreeRef = useRef<HTMLCanvasElement | null>(null);

  const handleExportPng = () => {
    let activeCanvas: HTMLCanvasElement | null = null;
    let filename = 'phong-thi-nghiem-hinh-hoc';

    if (currentTab === '2d') {
      activeCanvas = canvas2DRef.current;
      filename = 'hinh-hoc-phang-2d.png';
    } else if (currentTab === '3d') {
      activeCanvas = canvas3DRef.current;
      filename = 'hinh-hoc-khong-gian-3d.png';
    } else {
      activeCanvas = canvasFreeRef.current;
      filename = 'bang-ve-dung-hinh.png';
    }

    if (!activeCanvas) return;

    try {
      const dataUrl = activeCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export canvas image:', err);
    }
  };

  const handleDownloadSingleHtml = () => {
    downloadSingleFileHTML();
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#151e19] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Bar adhering to Top Bar Contract */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onExportPng={handleExportPng}
        onDownloadSingleHtml={handleDownloadSingleHtml}
      />

      {/* Main Workspace Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        {currentTab === '2d' && <Panel2D canvasRef={canvas2DRef} />}
        {currentTab === '3d' && <Panel3D canvasRef={canvas3DRef} />}
        {currentTab === 'freedraw' && <PanelFreeDraw canvasRef={canvasFreeRef} />}
      </div>
    </div>
  );
}
