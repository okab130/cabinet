import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ApprovalRequest } from '../../types/approval';
import ApprovalStepNode from './ApprovalStepNode';
import { Box } from '@mui/material';

const nodeTypes = { approvalStep: ApprovalStepNode };

interface Props {
  approval: ApprovalRequest;
}

const ApprovalFlowViewer: React.FC<Props> = ({ approval }) => {
  const { nodes, edges } = useMemo(() => {
    const ns: Node[] = [
      {
        id: 'start',
        type: 'input',
        position: { x: 0, y: 60 },
        data: { label: `申請者: ${approval.requesterName}` },
        style: { background: '#e3f2fd', border: '2px solid #1565C0', borderRadius: 8, fontSize: 12, padding: '8px 12px' },
      },
      ...approval.steps.map((step, i) => ({
        id: `step-${i}`,
        type: 'approvalStep',
        position: { x: 220 + i * 220, y: 40 },
        data: {
          label: `ステップ ${i + 1}`,
          approverName: step.approverName,
          status: step.status,
          comment: step.comment,
          actedAt: step.actedAt,
        },
      })),
      {
        id: 'end',
        type: 'output',
        position: { x: 220 + approval.steps.length * 220, y: 60 },
        data: { label: approval.status === 'approved' ? '✅ 承認完了' : approval.status === 'rejected' ? '❌ 差戻し' : '⏳ 処理中' },
        style: { background: approval.status === 'approved' ? '#e8f5e9' : approval.status === 'rejected' ? '#ffebee' : '#f5f5f5', border: '2px solid #bdbdbd', borderRadius: 8, fontSize: 12, padding: '8px 12px' },
      },
    ];

    const es: Edge[] = [
      { id: 'e-start-0', source: 'start', target: approval.steps.length > 0 ? 'step-0' : 'end', animated: true },
      ...approval.steps.slice(0, -1).map((_, i) => ({
        id: `e-${i}-${i + 1}`, source: `step-${i}`, target: `step-${i + 1}`, animated: approval.steps[i].status === 'approved',
      })),
      ...(approval.steps.length > 0 ? [{
        id: `e-last-end`, source: `step-${approval.steps.length - 1}`, target: 'end', animated: approval.steps[approval.steps.length - 1].status === 'approved',
      }] : []),
    ];

    return { nodes: ns, edges: es };
  }, [approval]);

  return (
    <Box sx={{ height: 220, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.3 }} proOptions={{ hideAttribution: true }}>
        <Background />
        <Controls showInteractive={false} />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>
    </Box>
  );
};

export default ApprovalFlowViewer;
