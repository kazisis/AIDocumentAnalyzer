import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Key, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ApiKey {
  provider: string;
  hasKey: boolean;
  lastUpdated?: string;
}

interface ApiKeyUpdate {
  provider: string;
  apiKey: string;
}

export default function ApiSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  const providers = [
    {
      id: "openai",
      name: "OpenAI",
      model: "GPT-4o",
      description: "범용성이 뛰어난 최신 GPT 모델",
      status: "범용성",
      placeholder: "sk-..."
    },
    {
      id: "anthropic",
      name: "Anthropic",
      model: "Claude 3.5 Sonnet",
      description: "분석력이 강한 Claude 모델",
      status: "분석력",
      placeholder: "sk-ant-..."
    },
    {
      id: "gemini",
      name: "Google Gemini",
      model: "Gemini 1.5 Pro",
      description: "빠른 처리 속도의 Google AI",
      status: "속도",
      placeholder: "AI..."
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      model: "DeepSeek-V2",
      description: "추론력이 뛰어난 AI 모델",
      status: "추론력",
      placeholder: "sk-..."
    },
    {
      id: "grok",
      name: "xAI Grok",
      model: "Grok",
      description: "실시간성이 강한 xAI 모델",
      status: "실시간성",
      placeholder: "xai-..."
    }
  ];

  // API 키 상태 조회
  const { data: apiKeyStatus } = useQuery<ApiKey[]>({
    queryKey: ['/api/settings/api-keys'],
    queryFn: () => apiRequest({ 
      url: '/api/settings/api-keys',
      method: 'GET',
      on401: 'returnNull'
    })
  });

  // API 키 업데이트
  const updateApiKeyMutation = useMutation({
    mutationFn: async (data: ApiKeyUpdate) => {
      return apiRequest({
        url: '/api/settings/api-keys',
        method: 'POST',
        body: data,
        on401: 'throw'
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "API 키 저장 완료",
        description: `${providers.find(p => p.id === variables.provider)?.name} API 키가 안전하게 저장되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/api-keys'] });
      // 입력 필드 초기화
      setApiKeys(prev => ({ ...prev, [variables.provider]: "" }));
    },
    onError: (error) => {
      toast({
        title: "저장 실패",
        description: "API 키 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  // API 키 삭제
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (provider: string) => {
      return apiRequest({
        url: `/api/settings/api-keys/${provider}`,
        method: 'DELETE',
        on401: 'throw'
      });
    },
    onSuccess: (_, provider) => {
      toast({
        title: "API 키 삭제 완료",
        description: `${providers.find(p => p.id === provider)?.name} API 키가 삭제되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/api-keys'] });
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "API 키 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const handleSaveApiKey = (provider: string) => {
    const apiKey = apiKeys[provider];
    if (!apiKey || apiKey.trim().length === 0) {
      toast({
        title: "API 키 입력 필요",
        description: "API 키를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    updateApiKeyMutation.mutate({ provider, apiKey: apiKey.trim() });
  };

  const handleDeleteApiKey = (provider: string) => {
    deleteApiKeyMutation.mutate(provider);
  };

  const getProviderStatus = (providerId: string) => {
    return apiKeyStatus?.find(status => status.provider === providerId);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">API 키 설정</h2>
        <p className="text-gray-600">
          AI 콘텐츠 생성을 위한 LLM 제공업체 API 키를 안전하게 관리하세요.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">보안 안내</h3>
            <p className="text-sm text-amber-700 mt-1">
              API 키는 암호화되어 서버에 안전하게 저장됩니다. 
              최소 하나의 LLM 제공업체 API 키가 있어야 콘텐츠 생성이 가능합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {providers.map((provider) => {
          const status = getProviderStatus(provider.id);
          const currentValue = apiKeys[provider.id] || "";
          const isUpdating = updateApiKeyMutation.isPending && updateApiKeyMutation.variables?.provider === provider.id;
          const isDeleting = deleteApiKeyMutation.isPending && deleteApiKeyMutation.variables === provider.id;

          return (
            <Card key={provider.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-gray-600" />
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <CardDescription>
                        {provider.model} - {provider.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      provider.status === "범용성" ? "default" : 
                      provider.status === "분석력" ? "secondary" :
                      provider.status === "속도" ? "outline" : 
                      provider.status === "추론력" ? "destructive" : "default"
                    }>
                      {provider.status}
                    </Badge>
                    {status?.hasKey && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Check className="h-3 w-3 mr-1" />
                        설정됨
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`api-key-${provider.id}`}>API 키</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={`api-key-${provider.id}`}
                        type={showKeys[provider.id] ? "text" : "password"}
                        placeholder={provider.placeholder}
                        value={currentValue}
                        onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleShowKey(provider.id)}
                      >
                        {showKeys[provider.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleSaveApiKey(provider.id)}
                      disabled={!currentValue.trim() || isUpdating}
                      className="min-w-[80px]"
                    >
                      {isUpdating ? "저장중..." : "저장"}
                    </Button>
                    {status?.hasKey && (
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteApiKey(provider.id)}
                        disabled={isDeleting}
                        className="min-w-[80px]"
                      >
                        {isDeleting ? "삭제중..." : "삭제"}
                      </Button>
                    )}
                  </div>
                </div>
                {status?.lastUpdated && (
                  <p className="text-xs text-gray-500">
                    마지막 업데이트: {new Date(status.lastUpdated).toLocaleString('ko-KR')}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">API 키 발급 가이드</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>OpenAI:</strong> platform.openai.com → API Keys</p>
          <p><strong>Anthropic:</strong> console.anthropic.com → API Keys</p>
          <p><strong>Google Gemini:</strong> ai.google.dev → Get API Key</p>
          <p><strong>DeepSeek:</strong> platform.deepseek.com → API Keys</p>
          <p><strong>xAI:</strong> console.x.ai → API Keys</p>
        </div>
      </div>
    </div>
  );
}