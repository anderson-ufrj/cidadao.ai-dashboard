'use client';

import { useEffect, useRef } from 'react';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';
import { AGENTS, AGENT_EDGES } from '@/lib/constants';
import { AgentRuntimeState } from '@/types/agent';

interface AgentGraphProps {
  agentStates: Record<string, AgentRuntimeState>;
  highlightedAgent?: string | null;
}

export function AgentGraph({ agentStates, highlightedAgent }: AgentGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build elements
    const elements: ElementDefinition[] = [];

    // Add nodes
    Object.entries(AGENTS).forEach(([id, agent]) => {
      elements.push({
        data: {
          id,
          label: agent.name,
          color: agent.color,
          layer: agent.layer,
          role: agent.role,
          image: agent.image || ''
        }
      });
    });

    // Add edges
    AGENT_EDGES.forEach(edge => {
      elements.push({
        data: {
          source: edge.source,
          target: edge.target
        }
      });
    });

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'background-image': 'data(image)',
            'background-fit': 'cover',
            'background-clip': 'none',
            'background-opacity': 1,
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': -10,
            'font-size': '11px',
            'font-weight': 'bold',
            'width': 60,
            'height': 60,
            'border-width': 3,
            'border-color': 'data(color)',
            'text-outline-width': 2,
            'text-outline-color': '#000',
            'text-background-color': '#000',
            'text-background-opacity': 0.7,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'transition-property': 'border-width, width, height',
            'transition-duration': 300
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.6,
            'arrow-scale': 1.5
          }
        },
        {
          selector: '.active',
          style: {
            'border-width': 5,
            'border-color': '#22c55e',
            'width': 70,
            'height': 70,
            'overlay-color': '#22c55e',
            'overlay-opacity': 0.3,
            'overlay-padding': 5
          }
        },
        {
          selector: '.thinking',
          style: {
            'border-color': '#eab308',
            'border-width': 5,
            'width': 68,
            'height': 68,
            'overlay-color': '#eab308',
            'overlay-opacity': 0.3,
            'overlay-padding': 4
          }
        },
        {
          selector: '.acting',
          style: {
            'border-color': '#3b82f6',
            'border-width': 5,
            'width': 68,
            'height': 68,
            'overlay-color': '#3b82f6',
            'overlay-opacity': 0.3,
            'overlay-padding': 4
          }
        },
        {
          selector: '.error',
          style: {
            'border-color': '#ef4444',
            'border-width': 5,
            'overlay-color': '#ef4444',
            'overlay-opacity': 0.4,
            'overlay-padding': 3
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 10,
        spacingFactor: 1.5,
        animate: true,
        animationDuration: 500
      },
      minZoom: 0.5,
      maxZoom: 3
    });

    // Store reference
    cyRef.current = cy;

    // Cleanup
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []); // Only initialize once

  // Update node styles based on agent states
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    // Remove all state classes
    cy.nodes().removeClass('active thinking acting error');

    // Apply state classes
    Object.entries(agentStates).forEach(([agentId, state]) => {
      const node = cy.getElementById(agentId);
      if (!node.empty()) {
        switch (state.state) {
          case 'COMPLETED':
            node.addClass('active');
            break;
          case 'THINKING':
            node.addClass('thinking');
            break;
          case 'ACTING':
            node.addClass('acting');
            break;
          case 'ERROR':
            node.addClass('error');
            break;
        }
      }
    });
  }, [agentStates]);

  // Handle highlighted agent
  useEffect(() => {
    if (!cyRef.current || !highlightedAgent) return;

    const cy = cyRef.current;
    const node = cy.getElementById(highlightedAgent);

    if (!node.empty()) {
      cy.animate({
        center: { eles: node },
        zoom: 2
      }, {
        duration: 500,
        easing: 'ease-in-out-cubic'
      });

      // Reset after 2 seconds
      setTimeout(() => {
        cy.fit(undefined, 50);
      }, 2000);
    }
  }, [highlightedAgent]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg bg-slate-900/50"
      style={{ minHeight: '400px' }}
    />
  );
}
