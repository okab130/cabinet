import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, List, ListItem,
  ListItemIcon, ListItemText, ListItemButton, Divider, Chip,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UploadIcon from '@mui/icons-material/Upload';
import PageHeader from '../components/common/PageHeader';
import { mockFolderTree } from '../data/mockData';
import { FolderNode } from '../types/folder';
import dayjs from 'dayjs';

const fileIcon = (mimeType?: string) => {
  if (!mimeType) return <InsertDriveFileIcon />;
  if (mimeType === 'application/pdf') return <PictureAsPdfIcon color="error" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <TableChartIcon color="success" />;
  return <InsertDriveFileIcon />;
};

const formatSize = (bytes?: number) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface TreeNodeProps { node: FolderNode; depth: number; selected: string | null; onSelect: (id: string) => void; }
const TreeNode: React.FC<TreeNodeProps> = ({ node, depth, selected, onSelect }) => {
  const [open, setOpen] = useState(depth === 0);
  if (!node.isFolder) return null;
  return (
    <Box>
      <ListItemButton
        dense
        sx={{ pl: depth * 2 + 1, bgcolor: selected === node.id ? '#e3f2fd' : 'transparent' }}
        onClick={() => { setOpen(!open); onSelect(node.id); }}
      >
        <ListItemIcon sx={{ minWidth: 28 }}>{open ? <FolderOpenIcon color="primary" fontSize="small" /> : <FolderIcon color="action" fontSize="small" />}</ListItemIcon>
        <ListItemText primary={<Typography variant="body2">{node.name}</Typography>} />
      </ListItemButton>
      {open && node.children?.map((child) => (
        <TreeNode key={child.id} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} />
      ))}
    </Box>
  );
};

const getAllFiles = (nodes: FolderNode[], folderId: string | null): FolderNode[] => {
  for (const node of nodes) {
    if (node.id === folderId) return (node.children ?? []).filter((c) => !c.isFolder);
    if (node.children) {
      const found = getAllFiles(node.children, folderId);
      if (found.length > 0 || node.children.some((c) => c.id === folderId)) return found;
    }
  }
  return [];
};

const Documents: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>('f001');
  const files = selectedFolder ? getAllFiles(mockFolderTree, selectedFolder) : [];

  return (
    <Box>
      <PageHeader
        title="文書ファイル管理" breadcrumbs={['ホーム', '文書管理']}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<CreateNewFolderIcon />} size="small">フォルダ作成</Button>
            <Button variant="contained" startIcon={<UploadIcon />} size="small">アップロード</Button>
          </Box>
        }
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ minHeight: 400 }}>
            <CardContent sx={{ p: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ px: 1, py: 0.5 }}>フォルダツリー</Typography>
              <Divider />
              <List dense disablePadding>
                {mockFolderTree.map((node) => (
                  <TreeNode key={node.id} node={node} depth={0} selected={selectedFolder} onSelect={setSelectedFolder} />
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={2} sx={{ minHeight: 400 }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>ファイル一覧</Typography>
              {files.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled' }}>
                  <InsertDriveFileIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2">ファイルがありません</Typography>
                </Box>
              ) : (
                <List dense>
                  {files.map((f) => (
                    <React.Fragment key={f.id}>
                      <ListItem secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip label={formatSize(f.size)} size="small" variant="outlined" />
                          <Button size="small" variant="outlined">ダウンロード</Button>
                        </Box>
                      }>
                        <ListItemIcon>{fileIcon(f.mimeType)}</ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={500}>{f.name}</Typography>}
                          secondary={f.updatedAt ? dayjs(f.updatedAt).format('YYYY/MM/DD HH:mm') : ''}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Documents;
