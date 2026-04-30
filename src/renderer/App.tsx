import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, Box, Button, FormControl, FormLabel, HStack, Input, Select, Text, VStack, Badge, Divider, useToast } from '@chakra-ui/react';
import { useWorkbenchStore } from './store';
import type { PlatformKey } from '../shared/types';

function Sidebar() {
  const toast = useToast();
  const { profiles, platforms, activeProfileId, refresh, createProfile, removeProfile, openProfile } = useWorkbenchStore();
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<PlatformKey>('whatsapp');
  const platformMap = useMemo(() => new Map(platforms.map((p) => [p.key, p.name])), [platforms]);

  useEffect(() => {
    if (platforms.length > 0 && !platforms.some((p) => p.key === platform)) {
      setPlatform(platforms[0].key);
    }
  }, [platform, platforms]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function addProfile() {
    if (!name.trim()) return toast({ status: 'warning', title: '请填写账号环境名称' });
    await createProfile(name.trim(), platform);
    setName('');
  }

  return (
    <Box w="360px" h="100vh" bg="gray.900" color="white" p="4" overflowY="auto">
      <Text fontSize="2xl" fontWeight="bold">Social Workbench</Text>
      <Text color="gray.400" fontSize="sm" mt="1">Telegram / Instagram / Facebook / WhatsApp 多账号隔离工作台</Text>
      <Divider my="4" borderColor="gray.700" />
      <VStack align="stretch" spacing="3">
        <FormControl>
          <FormLabel fontSize="sm">新环境名称</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：WA 客服 01" bg="gray.800" />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">平台</FormLabel>
          <Select value={platform} onChange={(e) => setPlatform(e.target.value as PlatformKey)} bg="gray.800" color="white">
            {platforms.map((p) => <option key={p.key} value={p.key} style={{ color: 'black' }}>{p.name}</option>)}
          </Select>
        </FormControl>
        <Button colorScheme="blue" onClick={addProfile}>创建账号环境</Button>
      </VStack>
      <Divider my="4" borderColor="gray.700" />
      <VStack align="stretch" spacing="2">
        {profiles.map((profile) => (
          <Box key={profile.id} p="3" borderRadius="md" bg={activeProfileId === profile.id ? 'blue.700' : 'gray.800'} border="1px solid" borderColor="gray.700">
            <HStack justify="space-between">
              <Box>
                <Text fontWeight="bold">{profile.name}</Text>
                <Badge colorScheme="purple">{platformMap.get(profile.platform) ?? profile.platform}</Badge>
              </Box>
              <Button size="xs" colorScheme="red" variant="outline" onClick={() => removeProfile(profile.id)}>删</Button>
            </HStack>
            <HStack mt="3">
              <Button size="sm" colorScheme="green" onClick={() => openProfile(profile.id)}>打开</Button>
              <Text fontSize="xs" color="gray.400">{profile.partitionKey}</Text>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

function EmptyWorkspace() {
  return (
    <Box ml="360px" h="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
      <Box textAlign="center" color="gray.500">
        <Text fontSize="3xl" fontWeight="bold">请选择或创建一个账号环境</Text>
        <Text mt="2">网页会显示在右侧区域；每个环境使用独立 session partition。</Text>
      </Box>
    </Box>
  );
}

function App() {
  return <><Sidebar /><EmptyWorkspace /></>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><ChakraProvider><App /></ChakraProvider></React.StrictMode>);
