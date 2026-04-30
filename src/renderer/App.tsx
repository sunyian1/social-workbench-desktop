import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Box,
  Button,
  ChakraProvider,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Switch,
  Text,
  VStack,
  extendTheme,
  useToast
} from '@chakra-ui/react';
import { useWorkbenchStore } from './store';
import type { PlatformKey, Profile, ProxyConfig } from '../shared/types';

const theme = extendTheme({
  fonts: {
    heading: 'Inter, Microsoft YaHei, system-ui, sans-serif',
    body: 'Inter, Microsoft YaHei, system-ui, sans-serif'
  },
  styles: { global: { body: { bg: '#f2f4f7', color: '#242936', overflow: 'hidden' } } },
  components: {
    Button: { baseStyle: { borderRadius: '4px', fontWeight: 500 } },
    Input: {
      variants: { outline: { field: { borderRadius: '3px', _focusVisible: { borderColor: '#f36a2f', boxShadow: '0 0 0 1px #f36a2f' } } } }
    }
  }
});

type AppMeta = { label: string; desc: string; icon: string; color: string; bg: string };

type OpenedTab = Pick<Profile, 'id' | 'name' | 'platform'>;

const platformMeta: Record<string, AppMeta> = {
  whatsapp: { label: 'WhatsApp', desc: '简单、私密、可靠', icon: '☎', color: '#22c55e', bg: '#e9f9ef' },
  'telegram-a': { label: 'Telegram', desc: '快速、安全、免费的通讯体验', icon: '✈', color: '#36a7e8', bg: '#eaf6ff' },
  'telegram-k': { label: 'Telegram', desc: '备用 Telegram 网页版本', icon: '✈', color: '#229ed9', bg: '#eaf6ff' },
  instagram: { label: 'Instagram', desc: '与您爱的人朋友创建并分享照片、故事和视频', icon: '◎', color: '#e1306c', bg: '#fff0f6' },
  facebook: { label: 'Facebook', desc: '探索你的热情所在', icon: 'f', color: '#1877f2', bg: '#edf5ff' },
  browserscan: { label: 'BrowserScan', desc: '检测每个账号环境的浏览器指纹差异', icon: 'BS', color: '#2563eb', bg: '#eff6ff' }
};

const extraApps: AppMeta[] = [
  { label: 'Line', desc: '允许您创建业务帐户以与客户进行通信', icon: 'LINE', color: '#06c755', bg: '#ecfff5' },
  { label: 'Messenger', desc: '实用性、社交性、表现力', icon: '⚡', color: '#168aff', bg: '#edf7ff' },
  { label: 'Twitter', desc: '加入此社交网络可获取最新信息和现场新闻', icon: '𝕏', color: '#111827', bg: '#f0f1f3' },
  { label: 'Zalo', desc: '快速地、稳定的、私人的', icon: 'Zalo', color: '#0068ff', bg: '#edf5ff' },
  { label: 'Tiktok', desc: '专注有趣创意的短视频社交App，年轻人交友的人气社群', icon: '♪', color: '#111827', bg: '#f0f1f3' },
  { label: 'Microsoft Teams', desc: '通话、聊天、协作', icon: 'T', color: '#6264a7', bg: '#f1f1ff' },
  { label: 'Snapchat', desc: '分享生活点滴!', icon: '👻', color: '#facc15', bg: '#fff9db' },
  { label: 'LineBusiness', desc: '企业级通讯解决方案', icon: 'L', color: '#06c755', bg: '#ecfff5' },
  { label: 'MetaBusiness', desc: '借助 Meta Business Suite 拓展业务并与更多用户建立联系', icon: '∞', color: '#1877f2', bg: '#edf5ff' },
  { label: 'LineWorks', desc: '团队高效协作的智能工作空间', icon: 'W', color: '#12b886', bg: '#ecfff5' },
  { label: 'Discord', desc: '为玩家而建，为所有人服务的聊天社区', icon: '☯', color: '#5865f2', bg: '#f0f2ff' }
];

function appMeta(platform: string): AppMeta {
  return platformMeta[platform] ?? platformMeta.whatsapp;
}

function AppIcon({ app, size = 46 }: { app: AppMeta; size?: number }) {
  return (
    <Box minW={`${size}px`} w={`${size}px`} h={`${size}px`} borderRadius="full" bg={app.bg} color={app.color} display="grid" placeItems="center" fontWeight="800" fontSize={app.icon.length > 2 ? '11px' : `${Math.round(size * 0.48)}px`}>
      {app.icon}
    </Box>
  );
}

function MiniSidebar({ activeTab }: { activeTab?: OpenedTab }) {
  const activeMeta = activeTab ? appMeta(activeTab.platform) : undefined;
  return (
    <Box w="58px" bg="#fff" borderRight="1px solid #e8ebf0" h="100vh" display="flex" flexDirection="column" alignItems="center" py="18px" position="relative" zIndex={20}>
      <Box w="4px" h="42px" bg="#f36a2f" borderRadius="0 8px 8px 0" position="absolute" left="0" top="22px" />
      <VStack spacing="18px" flex="1">
        <Box w="38px" h="38px" borderRadius="12px" bg="#fff1e8" color="#f0642b" display="grid" placeItems="center" fontSize="20px">⌂</Box>
        {activeMeta && <AppIcon app={activeMeta} size={38} />}
      </VStack>
      <VStack spacing="14px">
        <Box color="#9aa3af" fontSize="20px">⚙</Box>
        <Box color="#9aa3af" fontSize="20px">↩</Box>
      </VStack>
    </Box>
  );
}

function AccountCard() {
  return (
    <Box bg="white" border="1px solid #e8ebf0" borderRadius="4px" h="108px" display="flex" alignItems="center" px="28px">
      <Box w="58px" h="58px" borderRadius="full" bg="#ffe9dc" color="#f0642b" display="grid" placeItems="center" fontSize="28px" fontWeight="700" mr="28px">Y</Box>
      <HStack spacing="76px">
        <Box><Text color="#87909d" fontSize="14px">账号</Text><Text mt="8px" fontSize="17px" fontWeight="600">yian1</Text></Box>
        <Box><Text color="#87909d" fontSize="14px">今日消耗字符</Text><Text mt="8px" fontSize="17px" fontWeight="600">0</Text></Box>
      </HStack>
    </Box>
  );
}

function ContactCard() {
  return (
    <Box bg="white" border="1px solid #e8ebf0" borderRadius="4px" h="108px" p="18px 22px" display="flex" justifyContent="space-between" overflow="hidden">
      <Box>
        <Text fontWeight="700" fontSize="17px">联系我们</Text>
        <HStack mt="16px" spacing="10px">{['客服', '官网', '反馈'].map((item) => <Button key={item} size="sm" variant="outline" borderColor="#dfe3ea" bg="#fff">{item}</Button>)}</HStack>
      </Box>
      <Box w="98px" h="76px" bg="linear-gradient(135deg,#e9f4ff,#fff4e8)" borderRadius="18px" display="grid" placeItems="center" fontSize="34px">👩‍💻</Box>
    </Box>
  );
}

function AppCard({ app, supported, selected, onSelect }: { app: AppMeta; supported?: boolean; selected?: boolean; onSelect?: () => void }) {
  return (
    <Box as="button" type="button" textAlign="left" bg="white" border="1px solid" borderColor={selected ? '#ff8a4c' : '#e8ebf0'} borderRadius="4px" minH="86px" p="18px" display="flex" alignItems="center" opacity={supported ? 1 : 0.78} cursor={supported ? 'pointer' : 'not-allowed'} boxShadow={selected ? '0 0 0 2px rgba(255,107,53,.12)' : 'none'} onClick={supported ? onSelect : undefined} _hover={supported ? { borderColor: '#ff8a4c', transform: 'translateY(-1px)' } : undefined} transition="all .15s ease">
      <AppIcon app={app} />
      <Box minW="0" ml="14px">
        <Text fontWeight="700" fontSize="16px">{app.label}</Text>
        <Text mt="6px" color="#87909d" fontSize="13px" noOfLines={2}>{app.desc}</Text>
      </Box>
    </Box>
  );
}

function AddAppModal({ platform, onClose }: { platform?: PlatformKey; onClose: () => void }) {
  const toast = useToast();
  const { profiles, createProfile, createProxy, openProfile } = useWorkbenchStore();
  const [remark, setRemark] = useState('');
  const [useProxy, setUseProxy] = useState(false);
  const [proxyType, setProxyType] = useState<ProxyConfig['type']>('socks5');
  const [proxyHost, setProxyHost] = useState('');
  const [proxyPort, setProxyPort] = useState('');
  const [proxyUsername, setProxyUsername] = useState('');
  const [proxyPassword, setProxyPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const meta = platform ? platformMeta[platform] : undefined;
  const title = meta ? `新增 ${meta.label}` : '新增应用';

  useEffect(() => {
    setRemark(''); setUseProxy(false); setProxyType('socks5'); setProxyHost(''); setProxyPort(''); setProxyUsername(''); setProxyPassword('');
  }, [platform]);

  async function submit() {
    if (!platform || !meta) return;
    if (useProxy && (!proxyHost.trim() || !proxyPort.trim())) return toast({ status: 'warning', title: '请填写代理 IP 和端口' });
    const portNumber = Number(proxyPort);
    if (useProxy && (!Number.isInteger(portNumber) || portNumber <= 0 || portNumber > 65535)) return toast({ status: 'warning', title: '代理端口不正确' });
    setSubmitting(true);
    try {
      let proxyId: string | null = null;
      if (useProxy) {
        const proxy = await createProxy({ name: `${meta.label} 代理 ${profiles.length + 1}`, type: proxyType, host: proxyHost.trim(), port: portNumber, username: proxyUsername.trim() || undefined, password: proxyPassword || undefined });
        proxyId = proxy.id;
      }
      const finalName = remark.trim() || meta.label;
      const profile = await createProfile(finalName, platform, proxyId);
      await openProfile(profile.id);
      toast({ status: 'success', title: `已启动 ${finalName}`, description: useProxy ? '已绑定独立代理 IP。' : '已使用独立浏览器环境。' });
      onClose();
    } catch (error) {
      toast({ status: 'error', title: '启动失败', description: error instanceof Error ? error.message : String(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={Boolean(platform)} onClose={onClose} isCentered size="2xl">
      <ModalOverlay bg="rgba(35,39,47,.42)" />
      <ModalContent borderRadius="3px" overflow="hidden" boxShadow="0 18px 50px rgba(16,24,40,.18)">
        <ModalHeader bg="#f36a2f" color="white" fontSize="16px" fontWeight="600" h="48px" display="flex" alignItems="center" py="0">{title}</ModalHeader>
        <ModalCloseButton color="white" top="8px" />
        <ModalBody px="34px" pt="30px" pb="24px" minH="330px">
          <FormControl><FormLabel fontSize="14px" color="#343b48">备注</FormLabel><Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="请输入备注" borderColor="#f36a2f" _hover={{ borderColor: '#f36a2f' }} /></FormControl>
          <HStack mt="24px" spacing="14px" align="center"><Text fontSize="14px" color="#343b48">独立代理IP</Text><Switch isChecked={useProxy} onChange={(e) => setUseProxy(e.target.checked)} colorScheme="orange" /></HStack>
          {useProxy && <Box mt="18px" p="16px" bg="#fafafa" border="1px solid #eef1f5" borderRadius="4px">
            <HStack spacing="12px" align="start"><FormControl w="130px"><FormLabel fontSize="13px">代理类型</FormLabel><Select value={proxyType} onChange={(e) => setProxyType(e.target.value as ProxyConfig['type'])} bg="white"><option value="socks5">socks5</option><option value="http">http</option><option value="https">https</option><option value="socks4">socks4</option></Select></FormControl><FormControl flex="1"><FormLabel fontSize="13px">代理 IP / Host</FormLabel><Input value={proxyHost} onChange={(e) => setProxyHost(e.target.value)} placeholder="例如 1.2.3.4" bg="white" /></FormControl><FormControl w="120px"><FormLabel fontSize="13px">端口</FormLabel><Input value={proxyPort} onChange={(e) => setProxyPort(e.target.value)} placeholder="8000" bg="white" /></FormControl></HStack>
            <HStack mt="12px" spacing="12px"><FormControl><FormLabel fontSize="13px">用户名，可不填</FormLabel><Input value={proxyUsername} onChange={(e) => setProxyUsername(e.target.value)} bg="white" /></FormControl><FormControl><FormLabel fontSize="13px">密码，可不填</FormLabel><Input value={proxyPassword} onChange={(e) => setProxyPassword(e.target.value)} type="password" bg="white" /></FormControl></HStack>
          </Box>}
        </ModalBody>
        <ModalFooter bg="white" px="34px" pb="24px" pt="0"><Button variant="outline" borderColor="#dfe3ea" mr="12px" onClick={onClose}>关闭</Button><Button bg="#f36a2f" color="white" _hover={{ bg: '#e85f25' }} isLoading={submitting} onClick={() => void submit()}>启动应用</Button></ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function EmptyOpenedApps() {
  return <Box flex="1" display="grid" placeItems="center" minH="360px"><VStack spacing="12px" color="#b8c0cc"><Box w="66px" h="76px" border="2px solid #edf0f5" borderRadius="6px" position="relative" _after={{ content: '""', position: 'absolute', right: '-2px', top: '-2px', borderTop: '20px solid #f5f7fa', borderLeft: '20px solid transparent' }} /><Text color="#98a2b3" fontSize="14px">暂无打开的应用</Text></VStack></Box>;
}

function OpenedAppsPanel() {
  const { profiles, activeProfileId, openProfile, removeProfile, closeActive, refresh } = useWorkbenchStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allSelected = profiles.length > 0 && selectedIds.length === profiles.length;
  const selectedFirst = selectedIds[0];
  useEffect(() => setSelectedIds((ids) => ids.filter((id) => profiles.some((p) => p.id === id))), [profiles]);
  async function deleteSelected() { for (const id of selectedIds) await removeProfile(id); setSelectedIds([]); }
  function toggle(id: string) { setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]); }
  return (
    <Box bg="white" border="1px solid #e8ebf0" borderRadius="4px" flex="1" minH="0" p="18px" display="flex" flexDirection="column">
      <HStack justify="space-between" mb="16px" align="start"><HStack><Text fontWeight="700" fontSize="17px">打开的应用</Text><IconButton aria-label="refresh" size="xs" variant="ghost" icon={<span>↻</span>} onClick={() => void refresh()} /></HStack><HStack spacing="8px"><Button size="sm" variant="outline" borderColor="#dfe3ea" isDisabled={selectedIds.length === 0} onClick={() => void deleteSelected()}>删除</Button><Button size="sm" variant="outline" borderColor="#dfe3ea" isDisabled={!activeProfileId} onClick={() => void closeActive()}>关闭</Button><Button size="sm" variant="outline" borderColor="#dfe3ea" isDisabled={!selectedFirst} onClick={() => selectedFirst && void openProfile(selectedFirst)}>启动</Button></HStack></HStack>
      {profiles.length === 0 ? <EmptyOpenedApps /> : <VStack align="stretch" spacing="10px" flex="1" overflowY="auto" pr="4px">{profiles.map((profile) => { const meta = appMeta(profile.platform); const checked = selectedIds.includes(profile.id); return <HStack key={profile.id} bg={activeProfileId === profile.id ? '#f4f6f9' : '#fafbfc'} border="1px solid #eef1f5" borderRadius="4px" p="12px" spacing="12px"><Checkbox isChecked={checked} onChange={() => toggle(profile.id)} /><AppIcon app={meta} size={34} /><Box flex="1" minW="0"><Text fontWeight="600" noOfLines={1}>{profile.name}</Text><Text color="#87909d" fontSize="12px">{meta.label}</Text></Box><Button size="xs" colorScheme="green" onClick={() => void openProfile(profile.id)}>启动</Button></HStack>; })}</VStack>}
      <Checkbox mt="16px" isChecked={allSelected} onChange={(e) => setSelectedIds(e.target.checked ? profiles.map((p) => p.id) : [])}>全选</Checkbox>
    </Box>
  );
}

function AppTabs({ tabs, activeId, onOpen, onClose, onAdd }: { tabs: OpenedTab[]; activeId?: string; onOpen(id: string): void; onClose(id: string): void; onAdd(): void }) {
  return <Box h="42px" bg="#f7f8fa" borderBottom="1px solid #dfe3ea" display="flex" alignItems="end" pl="8px" gap="4px" position="relative" zIndex={30}><Button minW="28px" h="28px" mb="6px" p="0" bg="#f36a2f" color="white" _hover={{ bg: '#e85f25' }} onClick={onAdd}>＋</Button>{tabs.map((tab) => { const meta = appMeta(tab.platform); const active = tab.id === activeId; return <HStack as="button" type="button" key={tab.id} h="34px" minW="138px" maxW="180px" px="10px" mb="0" spacing="7px" bg={active ? '#fff' : '#eef1f5'} border="1px solid #dfe3ea" borderBottomColor={active ? '#fff' : '#dfe3ea'} borderRadius="6px 6px 0 0" onClick={() => onOpen(tab.id)}><AppIcon app={meta} size={22} /><Text fontSize="13px" fontWeight={active ? 600 : 500} noOfLines={1}>{appMeta(tab.platform).label}</Text><Box as="span" color="#8a94a6" fontSize="14px" ml="auto" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onClose(tab.id); }}>×</Box></HStack>; })}</Box>;
}

function WebToolPanel() {
  const tools = [{ t: '翻译设置', i: '⇄' }, { t: '快捷回复', i: '💬' }, { t: '客户信息', i: '☷' }, { t: '代理设置', i: '🌐' }];
  return <VStack position="fixed" right="0" top="42px" bottom="0" w="76px" bg="#fff" borderLeft="1px solid #e8ebf0" spacing="0" pt="18px" zIndex={25}>{tools.map((tool) => <VStack key={tool.t} spacing="7px" w="100%" py="16px" color="#6b7280"><Box fontSize="21px">{tool.i}</Box><Text fontSize="12px" sx={{ writingMode: 'vertical-rl' }} letterSpacing="1px">{tool.t}</Text></VStack>)}</VStack>;
}

function DashboardHome({ onCreate }: { onCreate(platform: PlatformKey): void }) {
  const toast = useToast();
  const { platforms } = useWorkbenchStore();
  const supportedApps = platforms.map((p) => ({ ...(platformMeta[p.key] ?? { label: p.name, desc: p.url, icon: p.name[0], color: '#64748b', bg: '#f1f5f9' }), key: p.key }));
  return <Box flex="1" p="18px" display="grid" gridTemplateColumns="1fr 360px" gap="18px" minW="0"><Box minW="0" display="flex" flexDirection="column" gap="18px"><AccountCard /><Box bg="transparent"><HStack justify="space-between" mb="14px"><Text fontSize="20px" fontWeight="700">应用中心</Text><HStack><Button size="sm" variant="outline" bg="white" borderColor="#dfe3ea" onClick={() => toast({ status: 'info', title: '当前已是最新版本' })}>检查更新</Button><Button size="sm" colorScheme="orange" onClick={() => toast({ status: 'info', title: '暂无可更新应用' })}>全部更新</Button></HStack></HStack><SimpleGrid columns={{ base: 2, xl: 3 }} spacing="14px">{supportedApps.map((app) => <AppCard key={app.key} app={app} supported onSelect={() => onCreate(app.key)} />)}{extraApps.map((app) => <AppCard key={app.label} app={app} />)}</SimpleGrid></Box></Box><Box minW="0" display="flex" flexDirection="column" gap="18px"><ContactCard /><OpenedAppsPanel /></Box></Box>;
}

function Dashboard() {
  const { profiles, activeProfileId, openProfile, closeProfile, refresh } = useWorkbenchStore();
  const [modalPlatform, setModalPlatform] = useState<PlatformKey | undefined>();
  useEffect(() => { void refresh(); }, [refresh]);
  const activeTab = profiles.find((p) => p.id === activeProfileId);
  const hasWebView = Boolean(activeProfileId);
  return <Box h="100vh" display="flex" bg="#f2f4f7"><MiniSidebar activeTab={activeTab} /><Box flex="1" minW="0" position="relative">{hasWebView ? <><AppTabs tabs={profiles} activeId={activeProfileId} onOpen={(id) => void openProfile(id)} onClose={(id) => void closeProfile(id)} onAdd={() => setModalPlatform('whatsapp')} /><WebToolPanel /></> : <DashboardHome onCreate={setModalPlatform} />}</Box><AddAppModal platform={modalPlatform} onClose={() => setModalPlatform(undefined)} /></Box>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><ChakraProvider theme={theme}><Dashboard /></ChakraProvider></React.StrictMode>);
