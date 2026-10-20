import React, { useCallback, useEffect, useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderIcon,
  GlobeIcon,
  SparklesIcon,
  CloudIcon,
  Share2Icon,
  LockIcon } from
'lucide-react';
interface Feature {
  name: string;
  label: string;
  description: string;
  icon: React.ElementType;
}
const features: Feature[] = [
{
  name: 'FOLDER STRUCTURE',
  label: 'Folder Structure',
  description:
  'Organize your tabs in a hierarchical folder structure for easy navigation and retrieval.',
  icon: FolderIcon
},
{
  name: 'ACCESS ANYWHERE',
  label: 'Access Anywhere',
  description:
  'Access your saved tabs from any device, anywhere in the world.',
  icon: GlobeIcon
},
{
  name: 'ONE-CLICK SAVE',
  label: 'One-Click Save',
  description:
  'Save all your open tabs with a single click for instant organization.',
  icon: SparklesIcon
},
{
  name: 'CLOUD SYNC',
  label: 'Cloud Sync',
  description:
  'Automatically sync your tabs across all your devices in real-time.',
  icon: CloudIcon
},
{
  name: 'SHARE COLLECTIONS',
  label: 'Share Collections',
  description:
  'Share your curated tab collections with teammates and collaborators.',
  icon: Share2Icon
},
{
  name: 'SECURE STORAGE',
  label: 'Secure Storage',
  description:
  'Your tabs are encrypted and stored securely with enterprise-grade protection.',
  icon: LockIcon
}];

const TOTAL_NODES = 8;
const ANGLE_STEP = 360 / TOTAL_NODES; // 45°
// SVG dimensions - wider for full-width arc
const SVG_WIDTH = 1600;
const SVG_HEIGHT = 560;
// Circle parameters - much larger circle with center far below for gentle wide arc
const CX = SVG_WIDTH / 2;
const CY = 1500;
const RADIUS = 1200;
// Node circle dimensions
const NODE_RADIUS = 38;
const CONNECTOR_DOT_RADIUS = 8;
// Calculate position on circle given angle from top (degrees), clockwise positive
function getPointOnCircle(
angleDeg: number,
radius: number,
cx: number,
cy: number)
{
  const angleRad = angleDeg * Math.PI / 180;
  return {
    x: cx + radius * Math.sin(angleRad),
    y: cy - radius * Math.cos(angleRad)
  };
}
export function RadialProcessUI() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const goToFeature = useCallback(
    (index: number) => {
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
    },
    [activeIndex]
  );
  // Auto-advance every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  // Rotation angle: rotate so that the active feature's node is at the top
  // Node 0 starts at top (0°). Feature i is at node i, so rotate by -(i * ANGLE_STEP)
  const rotationAngle = -activeIndex * ANGLE_STEP;
  // Build nodes data - offset nodes further from arc
  const nodes = Array.from(
    {
      length: TOTAL_NODES
    },
    (_, i) => {
      const baseAngle = i * ANGLE_STEP;
      const connectorPos = getPointOnCircle(baseAngle, RADIUS, CX, CY);
      const nodePos = getPointOnCircle(baseAngle, RADIUS + 70, CX, CY);
      return {
        index: i,
        number: i + 1,
        connectorPos,
        nodePos,
        baseAngle
      };
    }
  );
  function createArcPath(
  startAngleDeg: number,
  endAngleDeg: number,
  r: number,
  cx: number,
  cy: number)
  {
    const steps = 120;
    const points: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const angle = startAngleDeg + (endAngleDeg - startAngleDeg) * (i / steps);
      const p = getPointOnCircle(angle, r, cx, cy);
      points.push(`${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`);
    }
    return points.join(' ');
  }
  const activeFeature = features[activeIndex];
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: '#09090b',
        minHeight: '780px'
      }}>
      
      {/* SVG Arc and Nodes */}
      <div
        className="relative w-full"
        style={{
          height: `${SVG_HEIGHT}px`
        }}>
        
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMin meet"
          style={{
            overflow: 'visible'
          }}>
          
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Rotating group */}
          <g
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transformOrigin: `${CX}px ${CY}px`,
              transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
            
            {/* Dashed arc - full 360° circle so no gaps appear during rotation */}
            <path
              d={createArcPath(-180, 179.9, RADIUS, CX, CY)}
              fill="none"
              stroke="#2a2a2e"
              strokeWidth="1.5"
              strokeDasharray="12 10" />
            

            {/* Nodes */}
            {nodes.map((node) => {
              const isActive = node.index === activeIndex;
              const angularDist = Math.abs(
                (node.index - activeIndex + TOTAL_NODES) % TOTAL_NODES *
                ANGLE_STEP
              );
              const adjustedDist =
              angularDist > 180 ? 360 - angularDist : angularDist;
              // Connector dots visible across full 180° so ALL nodes show dots (including node 5 at 180°)
              const dotOpacity =
              adjustedDist <= 180 ? Math.max(0.08, 1 - adjustedDist / 200) : 0;
              const nodeOpacity =
              adjustedDist <= 90 ? Math.max(0.15, 1 - adjustedDist / 100) : 0;
              return (
                <g key={node.index}>
                  {/* Connector dot on the arc - visible across wider range */}
                  <circle
                    cx={node.connectorPos.x}
                    cy={node.connectorPos.y}
                    r={CONNECTOR_DOT_RADIUS}
                    fill={isActive ? '#999' : '#555'}
                    style={{
                      opacity: dotOpacity
                    }} />
                  

                  {/* Line from connector to node circle */}
                  <line
                    x1={node.connectorPos.x}
                    y1={node.connectorPos.y}
                    x2={node.nodePos.x}
                    y2={node.nodePos.y}
                    stroke={isActive ? '#555' : '#2a2a2e'}
                    strokeWidth="1"
                    style={{
                      opacity: nodeOpacity
                    }} />
                  

                  {/* Node circle */}
                  <circle
                    cx={node.nodePos.x}
                    cy={node.nodePos.y}
                    r={isActive ? NODE_RADIUS + 5 : NODE_RADIUS}
                    fill={isActive ? '#151518' : '#0e0e11'}
                    stroke={isActive ? '#666' : '#2a2a2e'}
                    strokeWidth={isActive ? 1.5 : 1}
                    style={{
                      opacity: nodeOpacity
                    }} />
                  

                  {isActive &&
                  <circle
                    cx={node.nodePos.x}
                    cy={node.nodePos.y}
                    r={NODE_RADIUS + 24}
                    fill="url(#nodeGlow)" />

                  }

                  {/* Node number text - counter-rotate to keep upright */}
                  <text
                    x={node.nodePos.x}
                    y={node.nodePos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isActive ? '#ccc' : '#444'}
                    fontSize={isActive ? '24' : '22'}
                    fontWeight="300"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    style={{
                      opacity: nodeOpacity,
                      transform: `rotate(${-rotationAngle}deg)`,
                      transformOrigin: `${node.nodePos.x}px ${node.nodePos.y}px`,
                      transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                    
                    {node.number}
                  </text>
                </g>);

            })}
          </g>
        </svg>

        {/* Center text overlay - pushed well below the arc */}
        <div
          className="absolute left-0 right-0 flex flex-col items-center pointer-events-none"
          style={{
            top: '58%'
          }}>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{
                opacity: 0,
                y: direction * 16
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: direction * -16
              }}
              transition={{
                duration: 0.45,
                ease: 'easeInOut'
              }}
              className="flex flex-col items-center text-center px-8">
              
              <h2
                className="text-white font-bold tracking-wider mb-4"
                style={{
                  fontSize: '46px',
                  letterSpacing: '0.08em',
                  lineHeight: 1.1
                }}>
                
                {activeFeature.name}
              </h2>
              <p
                className="max-w-lg"
                style={{
                  color: '#777',
                  fontSize: '16px',
                  fontStyle: 'italic',
                  lineHeight: 1.6
                }}>
                
                {activeFeature.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Feature Button Grid */}
      <div className="relative z-10 flex flex-col items-center px-4 mt-6">
        <div
          className="grid grid-cols-3 gap-3"
          style={{
            maxWidth: '680px'
          }}>
          
          {features.map((feature, i) => {
            const isActive = i === activeIndex;
            const IconComponent = feature.icon;
            return (
              <button
                key={i}
                onClick={() => goToFeature(i)}
                className="flex items-center gap-3 rounded-full px-5 py-3 transition-all duration-300 cursor-pointer"
                style={{
                  background: isActive ? '#1f1f24' : '#131316',
                  border: isActive ? '1px solid #3b82f6' : '1px solid #1a1a1e',
                  minWidth: '200px'
                }}
                aria-label={`Select ${feature.label}`}
                aria-pressed={isActive}>
                
                <IconComponent
                  size={16}
                  style={{
                    color: isActive ? '#3b82f6' : '#666',
                    flexShrink: 0
                  }} />
                
                <span
                  className="text-xs font-medium tracking-widest uppercase whitespace-nowrap"
                  style={{
                    color: isActive ? '#fff' : '#777'
                  }}>
                  
                  {feature.label}
                </span>
              </button>);

          })}
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center gap-2 mt-8 mb-8">
          {features.map((_, i) =>
          <button
            key={i}
            onClick={() => goToFeature(i)}
            className="transition-all duration-300"
            style={{
              width: i === activeIndex ? '24px' : '8px',
              height: '4px',
              borderRadius: '2px',
              background: i === activeIndex ? '#3b82f6' : '#444'
            }}
            aria-label={`Go to feature ${i + 1}`} />

          )}
        </div>
      </div>
    </section>);

}