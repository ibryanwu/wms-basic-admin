import React, { useEffect } from 'react';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  Handle,
  Position,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Tooltip from '@mui/material/Tooltip';
import Seo from '@/shared/layout-components/seo/seo';
import { useState, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import dagre from 'dagre';
import { ZoneDialog } from '@/component-lib/modal/meta/ZoneDialog';
import { useAtom } from 'jotai';
import {
  openBinModalAtom,
  openShelfModalAtom,
  openZoneModalAtom,
} from '@/stores/atom';
import { ShelfDialog } from '@/component-lib/modal/meta/ShelfDialog';
import { BinDialog } from '@/component-lib/modal/meta/BInDialog';
const ButtonGroup = ({ addDownAction, editAction, extendAction }: any) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      left: -40,
      top: -10,
    }}
  >
    <Tooltip title="Edit" placement="left">
      <IconButton color="primary" onClick={editAction} aria-label="edit">
        <EditNoteIcon />
      </IconButton>
    </Tooltip>
    {addDownAction && (
      <Tooltip title="Add Sub Node" placement="left">
        <IconButton
          color="primary"
          onClick={addDownAction}
          aria-label="add sub node"
        >
          <SubdirectoryArrowRightIcon />
        </IconButton>
      </Tooltip>
    )}

    <Tooltip title="Extend More Info" placement="left">
      <IconButton
        color="primary"
        onClick={extendAction}
        aria-label="Extend more info"
      >
        <ListAltIcon />
      </IconButton>
    </Tooltip>
  </div>
);
// 自定义组件
const ZoneNode = ({
  data,
  isSelected,
  addDownAction,
  editAction,
  extendAction,
}: any) => (
  <div
    style={{
      padding: 10,
      backgroundColor: '#ffc0a8',
      border: '1px solid #ddd',
      borderRadius: 5,
    }}
  >
    {isSelected && (
      <ButtonGroup
        addDownAction={addDownAction}
        editAction={editAction}
        extendAction={extendAction}
      />
    )}

    <strong>{data.label}</strong>
    <p>Capacity: {data.capacity}</p>
    <p>Location: {data.location}</p>
    <Handle
      type="source"
      position={Position.Right}
      style={{ background: '#555' }}
    />
  </div>
);

const ShelfNode = ({
  data,
  isSelected,
  addDownAction,
  editAction,
  extendAction,
}: any) => (
  <div
    style={{
      padding: 10,
      backgroundColor: '#4DA6FF',
      color: 'white',
      border: '1px solid #ddd',
      borderRadius: 5,
    }}
  >
    {isSelected && (
      <ButtonGroup
        addDownAction={addDownAction}
        editAction={editAction}
        extendAction={extendAction}
      />
    )}
    <strong>{data.label}</strong>
    <p>Capacity: {data.capacity}</p>
    <p>Location: {data.location}</p>
    <Handle
      type="target"
      position={Position.Left}
      style={{ background: '#555' }}
    />
    <Handle
      type="source"
      position={Position.Top}
      style={{ background: '#555' }}
    />
  </div>
);

const BinNode = ({
  data,
  isSelected,
  addDownAction,
  editAction,
  extendAction,
}: any) => (
  <div
    style={{
      padding: 10,
      backgroundColor: '#99CC99',
      color: 'white',
      border: '1px solid #ddd',
      borderRadius: 5,
    }}
  >
    {isSelected && (
      <ButtonGroup
        addDownAction={addDownAction}
        editAction={editAction}
        extendAction={extendAction}
      />
    )}
    <strong>{data.label}</strong>
    <p>Capacity: {data.capacity}</p>
    <p>Location: {data.location}</p>
    <Handle
      type="target"
      position={Position.Top}
      style={{ background: '#555' }}
    />
  </div>
);

// 自动布局函数，水平排列Zone和Shelf
const getLayoutedElements = (nodes: any, edges: any) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', align: 'UL', marginx: 50, marginy: 50 });

  nodes.forEach((node: any) => {
    if (node.type !== 'bin') {
      // 只对 Zone 和 Shelf 使用 dagre 布局
      dagreGraph.setNode(node.id, { width: 200, height: 100 });
    }
  });
  edges.forEach((edge: any) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node: any) => {
    if (node.type !== 'bin') {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
      };
    }
    return node; // bin nodes will be positioned manually
  });

  return { nodes: layoutedNodes, edges };
};

type NodeType = {
  id: string;
  name: string;
  type: string;
  data?: any;
  // 添加其他属性
};
type LocationEditItem = {
  capacity: number;
  description: string;
  id: number;
  isActive: boolean;
  isDefault: boolean;
  location: string;
  name: string;
  storageType: string;
  warehouse_id?: number;
  shelf_id?: number;
  bin_id?: number;
};

export default function Flow(prop: any) {
  const { locationData } = prop;
  const { data, warehouseId } = locationData || {};

  // Values  -------------------------------------------------

  // Atoms ---------------------------------------------------
  const [openZoneModal, setOpenZoneModal] = useAtom(openZoneModalAtom);
  const [openShelfModal, setOpenShelfModal] = useAtom(openShelfModalAtom);
  const [openBinModal, setOpenBinModal] = useAtom(openBinModalAtom);

  // UseState  -----------------------------------------------
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [editZone, setEditZone] = useState<LocationEditItem | undefined>(
    undefined,
  );
  const [editShelf, setEditShelf] = useState<LocationEditItem | undefined>(
    undefined,
  );
  const [editBIn, setEditBin] = useState<LocationEditItem | undefined>(
    undefined,
  );
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);

  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  // Use Effect  ---------------------------------------------

  // Function ------------------------------------------------

  const addDownAction = () => {
    setEditZone(undefined);
    setEditShelf(undefined);
    setEditBin(undefined);

    if (selectedNode && selectedNode.type === 'zone') {
      setOpenShelfModal(true);
    } else if (selectedNode && selectedNode.type === 'shelf') {
      setOpenBinModal(true);
    }
  };

  const editAction = () => {
    if (selectedNode) {
      console.log('🚀 ~ editAction ~ selectedNode:', selectedNode);
      if (selectedNode && selectedNode.type === 'zone') {
        setEditZone(selectedNode.data);
        setOpenZoneModal(true);
      } else if (selectedNode && selectedNode.type === 'shelf') {
        setEditShelf(selectedNode.data);
        setOpenShelfModal(true);
      } else if (selectedNode && selectedNode.type === 'bin') {
        setEditBin(selectedNode.data);
        setOpenBinModal(true);
      }
    }
  };

  const extendAction = () => alert('coming soon...');

  const nodeTypes = {
    zone: (props: any) => (
      <ZoneNode
        {...props}
        isSelected={props.id === selectedNode?.id}
        addDownAction={addDownAction}
        editAction={editAction}
        extendAction={extendAction}
      />
    ),
    shelf: (props: any) => (
      <ShelfNode
        {...props}
        isSelected={props.id === selectedNode?.id}
        addDownAction={addDownAction}
        editAction={editAction}
        extendAction={extendAction}
      />
    ),
    bin: (props: any) => (
      <BinNode
        {...props}
        isSelected={props.id === selectedNode?.id}
        // addDownAction={addDownAction}
        editAction={editAction}
        extendAction={extendAction}
      />
    ),
  };
  useEffect(() => {
    if (data.length === 0) {
      // 清空所有节点和边
      setNodes([]);
      setEdges([]);
    } else if (data.length > 0) {
      const initialNodes: any = [];
      const initialEdges: any = [];
      data.forEach((zone: any) => {
        console.log('🚀 ~ data.forEach ~ zone:', zone);
        const zoneId = `zone-${zone.id}`;
        initialNodes.push({
          id: zoneId,
          data: {
            label: zone.name,
            capacity: zone.capacity,
            location: zone.location,
            ...zone,
          },
          type: 'zone',
          position: { x: 0, y: 0 }, // 初始位置
        });
        // 检查是否有 shelves 数据
        if (zone.shelves && zone.shelves.length > 0) {
          zone.shelves.forEach((shelf: any) => {
            const shelfId = `shelf-${shelf.id}`;
            initialNodes.push({
              id: shelfId,
              data: {
                label: shelf.name,
                capacity: shelf.capacity,
                location: shelf.location,
                ...shelf,
              },
              type: 'shelf',
              position: { x: 0, y: 0 },
            });
            initialEdges.push({
              id: `${zoneId}-${shelfId}`,
              source: zoneId,
              target: shelfId,
              type: 'smoothstep',
              animated: true,
              style: { strokeWidth: 2 }, // 加粗线条
            });
            // 检查是否有 shelves 数据
            if (zone.shelves && zone.shelves.length > 0) {
              // 将 Bin 节点水平排列
              shelf.bins.forEach((bin: any) => {
                const binId = `bin-${bin.id}`;
                initialNodes.push({
                  id: binId,
                  data: {
                    label: bin.name,
                    capacity: bin.capacity,
                    location: bin.location,
                    ...bin,
                  },
                  type: 'bin',
                  position: { x: 0, y: 0 }, // 初始位置
                });
                initialEdges.push({
                  id: `${shelfId}-${binId}`,
                  source: shelfId,
                  target: binId,
                  type: 'smoothstep',
                  animated: true,
                  style: { strokeWidth: 2 }, // 加粗线条
                });
              });
            }
          });
        }
      });
      // 应用自动布局
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(initialNodes, initialEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [data]);
  // 根据 Shelf 节点位置调整每个 Shelf 的 Bin 节点位置
  nodes.forEach((node: any) => {
    if (node.type === 'shelf') {
      const shelfNode = node;
      const binsForShelf = nodes.filter(
        (n: any) =>
          n.id.startsWith(`bin-`) &&
          edges.find(
            (edge: any) => edge.source === shelfNode.id && edge.target === n.id,
          ),
      );

      let binXOffset = shelfNode.position.x + 200; // bin 起始位置在 shelf 右侧
      binsForShelf.forEach((binNode: any) => {
        binNode.position = { x: binXOffset, y: shelfNode.position.y }; // 水平对齐在 Shelf 的右侧
        binXOffset += 200; // bin之间的水平间隔
      });
    }
  });

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds: any) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds: any) => applyEdgeChanges(changes, eds)),
    [],
  );
  // 点击节点事件处理
  const onNodeClick = useCallback((event: any, node: any) => {
    console.log('🚀 ~ onNodeClick ~ node:', node);
    setSelectedNode(node);
  }, []);

  return (
    <>
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '4px', // 圆角
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // 阴影
          overflow: 'hidden', // 防止子元素溢出圆角
          width: '100%',
          height: '80vh', //屏幕自适应 100vh
        }}
      >
        <ZoneDialog
          editingItem={editZone}
          showAddBt={true}
          setEditItem={setEditZone}
          warehouseId={warehouseId}
        />

        {openShelfModal && (
          <ShelfDialog
            editingItem={editShelf}
            showAddBt={false}
            setEditItem={setEditShelf}
            zoneId={selectedNode?.data.id} //新建的时候建在那个zone下面
          />
        )}
        {openBinModal && (
          <BinDialog
            editingItem={editBIn}
            showAddBt={false}
            setEditItem={setEditBin}
            shelfId={selectedNode?.data.id} //新建的时候建在那个shelfId下面
          />
        )}

        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick} // 点击事件
          nodeTypes={nodeTypes}
          // fitViewOptions={{ padding: 10 }}
          nodesDraggable={false} // 禁止所有节点拖动
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </>
  );
}
