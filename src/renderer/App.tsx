import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Badge,
  Box,
  Button,
  ChakraProvider,
  Checkbox,
  HStack,
  IconButton,
  Input,
  SimpleGrid,
  Text,
  VStack,
  extendTheme,
  useToast
} from '@chakra-ui/react';
import { useWorkbenchStore } from './store';
import type { PlatformKey } from '../shared/types';

const theme = extendTheme({
  fonts: {
    heading: 'Inter, Microsoft YaHei, system-ui, sans-serif',
    body: 'Inter, Microsoft YaHei, system-ui, sans-serif'
  },
  styles: {
    global: {
      body: {
        bg: '#f3f5f8',
        color: '#202633'
      }
    }
  }
});

const platformMeta: Record<string, { label: string; desc: string; icon: string; color: string; bg: string }> = {
  whatsapp: { label: 'WhatsApp', desc: '简单、私密、可靠', icon: '☎', color: '#22c55e', bg: '#e9f9ef' },
  'telegram-a': { label: 'Telegram', desc: '快速、安全、免费的通讯体验', icon: '✈', color: '#36a7e8', bg: '#eaf6ff' },
  'telegram-k': { label: 'Telegram K', desc: '备用 Telegram 网页版本', icon: '✈', color: '#229ed9', bg: '#eaf6ff' },
  instagram: { label: 'Instagram', desc: '创建并分享照片、故事和视频', icon: '◎', color: '#e1306c', bg: '#fff0f6' },
  facebook: { label: 'Facebook', desc: '探索你的热情所在', icon: 'f', color: '#1877f2', bg: '#edf5ff' }
};

const extraApps = [
  { label: 'Line', desc: '允许您创建业务帐户以与客户进行通信', icon: 'LINE', color: '#06c755', bg: '#ecfff5' },
  { label: 'Messenger', desc: '实用性、社交性、表现力', icon: '⚡', color: '#168aff', bg: '#edf7ff' },
  { label: 'Twitter', desc: '加入社交网络获取最新信息和现场新闻', icon: '𝕏', color: '#111827', bg: '#f0f1f3' },
  { label: 'Zalo', desc: '快速地、稳定的、私人的', icon: 'Zalo', color: '#0068ff', bg: '#edf5ff' },
  { label: 'Tiktok', desc: '专注有趣创意的短视频社交App', icon: '♪', color: '#111827', bg: '#f0f1f3' },
  { label: 'Microsoft Teams', desc: '通话、聊天、协作', icon: 'T', color: '#6264a7', bg: '#f1f1ff' },
  { label: 'Snapchat', desc: '分享生活点滴!', icon: '👻', color: '#facc15', bg: '#fff9db' },
  { label: 'MetaBusiness', desc: '拓展业务并与更多用户建立联系', icon: '∞', color: '#1877f2', bg: '#edf5ff' },
  { label: 'Discord', desc: '为玩家而建，为所有人服务的聊天社区', icon: '☯', color: '#5865f2', bg: '#f0f2ff' }
];

function MiniSidebar() {
  return (
    <Box w="58px" bg="#ffffff" borderRight="1px solid #e8ebf0" h="100vh" display="flex" flexDirection="column" alignItems="center" py="18px">
      <Box w="4px" h="42px" bg="#ff6b35" borderRadius="0 8px 8px 0" position="absolute" left="0" top="22px" />
      <VStack spacing="18px" flex="1">
        <Box w="38px" h="38px" borderRadius="12px" bg="#fff1e8" color="#f0642b" display="grid" placeItems="center" fontSize="20px">⌂</Box>
        <Box w="38px" h="38px" borderRadius="12px" bg="#eaf9f0" color="#16a34a" display="grid" placeItems="center" fontSize="19px">☎</Box>
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
        <Box>
          <Text color="#87909d" fontSize="14px">账号</Text>
          <Text mt="8px" fontSize="17px" fontWeight="600">yian1</Text>
        </Box>
        <Box>
          <Text color="#87909d" fontSize="14px">今日消耗字符</Text>
          <Text mt="8px" fontSize="17px" fontWeight="600">0</Text>
        </Box>
      </HStack>
    </Box>
  );
}

function ContactCard() {
  return (
    <Box bg="white" border="1px solid #e8ebf0" borderRadius="4px" h="108px" p="18px 22px" display="flex" justifyContent="space-between" overflow="hidden">
      <Box>
        <Text fontWeight="700" fontSize="17px">联系我们</Text>
        <HStack mt="16px" spacing="10px">
          {['客服', '官网', '反馈'].map((item) => <Button key={item} size="sm" variant="outline" borderColor="#dfe3ea" bg="#fff">{item}</Button>)}
        </HStack>
      </Box>
      <Box w="98px" h="76px" bg="linear-gradient(135deg,#e9f4ff,#fff4e8)" borderRadius="18px" display="grid" placeItems="center" fontSize="34px">👩‍💻</Box>
    </Box>
  );
}

function AppCard({ app, supported, selected, onSelect }: { app: { label: string; desc: string; icon: string; color: string; bg: string }; supported?: boolean; selected?: boolean; onSelect?: () => void }) {
  return (
    <Box
      as="button"
      type="button"
      textAlign="left"
      bg="white"
      border="1px solid"
      borderColor={selected ? '#ff8a4c' : '#e8ebf0'}
      borderRadius="4px"
      minH="86px"
      p="18px"
      display="flex"
      alignItems="center"
      opacity={supported ? 1 : 0.68}
      cursor={supported ? 'pointer' : 'not-allowed'}
      boxShadow={selected ? '0 0 0 2px rgba(255,107,53,.12)' : 'none'}
      onClick={supported ? onSelect : undefined}
      _hover={supported ? { borderColor: '#ff8a4c', transform: 'translateY(-1px)' } : undefined}
      transition="all .15s ease"
    >
      <Box minW="46px" h="46px" borderRadius="full" bg={app.bg} color={app.color} display="grid" placeItems="center" fontWeight="800" fontSize={app.icon.length > 2 ? '12px' : '23px'} mr="14px">{app.icon}</Box>
      <Box minW="0">
        <HStack spacing="8px">
          <Text fontWeight="700" fontSize="16px">{app.label}</Text>
          {supported && <Badge colorScheme="green" variant="subtle">可用</Badge>}
        </HStack>
        <Text mt="6px" color="#87909d" fontSize="13px" noOfLines={2}>{app.desc}</Text>
      </Box>
    </Box>
  );
}

function OpenedAppsPanel() {
  const { profiles, activeProfileId, openProfile, removeProfile, platforms } = useWorkbenchStore();
  const platformMap = useMemo(() => new Map(platforms.map((p) => [p.key, p.name])), [platforms]);

  return (
    <Box bg="white" border="1px solid #e8ebf0" borderRadius="4px" flex="1" minH="0" p="18px">
      <HStack justify="space-between" mb="16px">
        <HStack>
          <Text fontWeight="700" fontSize="17px">打开的应用</Text>
          <IconButton aria-label="refresh" size="xs" variant="ghost" icon={<span>↻</span>} />
        </HStack>
        <HStack spacing="8px">
          <Button size="sm" variant="outline" borderColor="#dfe3ea" isDisabled>删除</Button>
          <Button size="sm" variant="outline" borderColor="#dfe3ea" isDisabled>关闭</Button>
          <Button size="sm" variant="outline" borderColor="#dfe3ea" isDisabled>启动</Button>
        </HStack>
      </HStack>

      <VStack align="stretch" spacing="10px" maxH="calc(100vh - 250px)" overflowY="auto" pr="4px">
        {profiles.length === 0 && <Text color="#98a2b3" fontSize="14px" py="16px">暂无应用，点击左侧应用卡片创建。</Text>}
        {profiles.map((profile) => {
          const meta = platformMeta[profile.platform] ?? platformMeta.whatsapp;
          return (
            <HStack key={profile.id} bg={activeProfileId === profile.id ? '#f4f6f9' : '#fafbfc'} border="1px solid #eef1f5" borderRadius="4px" p="12px" spacing="12px">
              <Checkbox />
              <Box w="34px" h="34px" borderRadius="full" bg={meta.bg} color={meta.color} display="grid" placeItems="center" fontWeight="800">{meta.icon}</Box>
              <Box flex="1" minW="0">
                <Text fontWeight="600" noOfLines={1}>{profile.name}</Text>
                <Text color="#87909d" fontSize="12px">{platformMap.get(profile.platform) ?? profile.platform}</Text>
              </Box>
              <Button size="xs" colorScheme="green" onClick={() => openProfile(profile.id)}>启动</Button>
              <Button size="xs" variant="ghost" colorScheme="red" onClick={() => removeProfile(profile.id)}>删</Button>
            </HStack>
          );
        })}
      </VStack>
      <Checkbox mt="16px">全选</Checkbox>
    </Box>
  );
}

function Dashboard() {
  const toast = useToast();
  const { profiles, platforms, activeProfileId, refresh, createProfile } = useWorkbenchStore();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>('whatsapp');
  const [name, setName] = useState('');

  useEffect(() => { void refresh(); }, [refresh]);

  const supportedApps = platforms.map((p) => {
    const meta = platformMeta[p.key] ?? { label: p.name, desc: p.url, icon: p.name[0], color: '#64748b', bg: '#f1f5f9' };
    return { ...meta, key: p.key };
  });

  async function launchPlatform(key: PlatformKey, label: string) {
    const finalName = name.trim() || `${label} ${profiles.filter((p) => p.platform === key).length + 1}`;
    setSelectedPlatform(key);
    await createProfile(finalName, key);
    setName('');
    toast({ status: 'success', title: `已创建 ${finalName}`, description: '请在右侧打开的应用中点击启动。' });
  }

  return (
    <Box h="100vh" display="flex" bg="#f3f5f8">
      <MiniSidebar />
      <Box flex="1" p="18px" display="grid" gridTemplateColumns="1fr 360px" gap="18px" minW="0">
        <Box minW="0" display="flex" flexDirection="column" gap="18px">
          <AccountCard />
          <Box bg="transparent">
            <HStack justify="space-between" mb="14px">
              <Text fontSize="20px" fontWeight="700">应用中心</Text>
              <HStack>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="环境名称，可不填" bg="white" borderColor="#e8ebf0" w="220px" size="sm" />
                <Button size="sm" variant="outline" bg="white" borderColor="#dfe3ea">检查更新</Button>
                <Button size="sm" colorScheme="orange">全部更新</Button>
              </HStack>
            </HStack>
            <SimpleGrid columns={{ base: 2, xl: 3 }} spacing="14px">
              {supportedApps.map((app) => (
                <AppCard key={app.key} app={app} supported selected={selectedPlatform === app.key} onSelect={() => void launchPlatform(app.key, app.label)} />
              ))}
              {extraApps.map((app) => <AppCard key={app.label} app={app} />)}
            </SimpleGrid>
          </Box>
        </Box>
        <Box minW="0" display="flex" flexDirection="column" gap="18px">
          <ContactCard />
          <OpenedAppsPanel />
        </Box>
      </Box>
      {activeProfileId && <Box position="fixed" left="58px" right="378px" bottom="18px" h="34px" bg="rgba(255,255,255,.92)" border="1px solid #e8ebf0" borderRadius="4px" px="14px" display="flex" alignItems="center" color="#667085" fontSize="13px">网页视图已在工作区打开；若需要回到应用中心，请关闭当前环境或切换其他环境。</Box>}
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Dashboard />
    </ChakraProvider>
  </React.StrictMode>
);
