import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useFilters } from '../context/FilterContext';
import { nodes, links as sharedLinks, CAT_COLOR } from '../data/pidData';
import './GraphView.css';

export default function GraphView() {
  const svgRef = useRef(null);
  const dimRef = useRef(() => {});
  const { visibleNodeIds } = useFilters();

  useEffect(() => {
    const container = svgRef.current;
    const W = container.clientWidth || 800;
    const H = container.clientHeight || 600;

    // Clone links so d3.forceLink's source/target-id-to-object mutation stays local
    // to this component and never corrupts the shared `links` array other views read.
    const links = sharedLinks.map(l => ({ ...l }));

    function nc(d) { return d.cat === 'hub' ? d.color : CAT_COLOR[d.cat]; }
    function lc(d) {
      const s = d.source, t = d.target;
      if (s.cat !== 'hub') return CAT_COLOR[s.cat];
      if (t.cat !== 'hub') return CAT_COLOR[t.cat];
      return '#475569';
    }

    const svg = d3.select(container).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g');
    const zoom = d3.zoom().scaleExtent([0.08, 5]).on('zoom', ({ transform }) => g.attr('transform', transform));
    svg.call(zoom);

    const coreLinks = g.append('g').selectAll('line').data(links).join('line')
      .attr('stroke-width', 0.9).attr('stroke-opacity', 0.28);

    let dragMoved = false;
    const nodeG = g.append('g').selectAll('g').data(nodes).join('g').attr('class', 'node')
      .call(d3.drag()
        .on('start', (ev, d) => { dragMoved = false; if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (ev, d) => { dragMoved = true; d.fx = ev.x; d.fy = ev.y; })
        .on('end', (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    nodeG.append('circle')
      .attr('r', d => d.r || 3)
      .attr('fill', d => nc(d))
      .attr('fill-opacity', d => d.cat === 'hub' ? 0.9 : 0.72)
      .attr('stroke', d => nc(d)).attr('stroke-width', 0.5).attr('stroke-opacity', 0.6);

    nodeG.filter(d => d.label)
      .append('text')
      .attr('dy', d => d.cat === 'hub' ? d.r + 12 : -(d.r + 4))
      .attr('text-anchor', 'middle')
      .attr('font-size', d => d.cat === 'hub' ? '11px' : '8px')
      .attr('font-weight', '700')
      .attr('fill', d => nc(d))
      .style('pointer-events', 'none')
      .text(d => d.label);

    const tip = document.createElement('div');
    tip.className = 'graph-tip';
    tip.style.display = 'none';
    container.parentElement.appendChild(tip);

    nodeG
      .on('mouseover', function (ev, d) {
        tip.innerHTML = `<strong>${d.label || d.id}</strong>${d.sub ? `<br>${d.sub}` : ''}`;
        tip.style.display = 'block';
        tip.style.left = ev.clientX + 14 + 'px';
        tip.style.top = ev.clientY - 40 + 'px';
      })
      .on('mousemove', ev => { tip.style.left = ev.clientX + 14 + 'px'; tip.style.top = ev.clientY - 40 + 'px'; })
      .on('mouseout', () => { tip.style.display = 'none'; })
      .on('click', function (ev, d) { ev.stopPropagation(); if (dragMoved) return; /* focus-panel omitted from initial port, matches List+Deps view instead */ });

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
        const sh = d.source.cat === 'hub', th = d.target.cat === 'hub';
        return (sh && th) ? 135 : (sh || th) ? 68 : 28;
      }).strength(0.35))
      .force('charge', d3.forceManyBody().strength(d => d.cat === 'hub' ? -700 : d.r > 5 ? -90 : -42))
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.06))
      .force('collide', d3.forceCollide().radius(d => (d.r || 3) + 2.5).strength(0.7))
      .on('tick', () => {
        coreLinks.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y).attr('stroke', d => lc(d));
        nodeG.attr('transform', d => `translate(${d.x},${d.y})`);
      });

    dimRef.current = (visibleIds) => {
      nodeG.select('circle').attr('fill-opacity', d => visibleIds.has(d.id) ? (d.cat === 'hub' ? 0.9 : 0.72) : 0.04);
      coreLinks.attr('stroke-opacity', l => (visibleIds.has(l.source.id ?? l.source) && visibleIds.has(l.target.id ?? l.target)) ? 0.28 : 0.02);
    };
    dimRef.current(visibleNodeIds);

    return () => {
      sim.stop();
      tip.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dimRef.current(visibleNodeIds);
  }, [visibleNodeIds]);

  return (
    <div className="graph-view-wrapper">
      <svg ref={svgRef} className="graph-svg" />
    </div>
  );
}
