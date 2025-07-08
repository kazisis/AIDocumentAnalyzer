import { useState } from "react";
import { Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

export default function LLMSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("openai");

  const providers = [
    {
      id: "openai",
      name: "OpenAI",
      model: "GPT-4o",
      description: "최신 GPT-4o 모델로 빠르고 정확한 콘텐츠 생성",
      status: "범용성"
    },
    {
      id: "anthropic",
      name: "Anthropic",
      model: "Claude 3.5 Sonnet",
      description: "Claude 3.5 Sonnet으로 더욱 정교한 분석과 창의적 콘텐츠",
      status: "분석력"
    },
    {
      id: "gemini",
      name: "Google",
      model: "Gemini 1.5 Pro",
      description: "Google의 최신 멀티모달 AI로 빠른 처리와 정확한 분석",
      status: "속도"
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      model: "DeepSeek-V2",
      description: "코딩과 추론에 특화된 고성능 AI 모델",
      status: "추론력"
    },
    {
      id: "grok",
      name: "xAI",
      model: "Grok",
      description: "실시간 정보 접근과 창의적 사고에 강한 AI",
      status: "실시간성"
    }
  ];

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    // Here you would typically save this to localStorage or send to backend
    localStorage.setItem('llm_provider', providerId);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            AI 모델 설정
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI 제공업체 선택</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => handleProviderChange(provider.id)}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedProvider === provider.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{provider.name}</h4>
                      <Badge variant={
                        provider.status === "범용성" ? "default" : 
                        provider.status === "분석력" ? "secondary" :
                        provider.status === "속도" ? "outline" : 
                        provider.status === "추론력" ? "destructive" : "default"
                      }>
                        {provider.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{provider.model}</p>
                    <p className="text-xs text-gray-500">{provider.description}</p>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedProvider === provider.id
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}>
                      {selectedProvider === provider.id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">현재 선택:</span>
                <span className="font-medium text-gray-900">
                  {providers.find(p => p.id === selectedProvider)?.name} - {providers.find(p => p.id === selectedProvider)?.model}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>💡 팁:</strong> 각 AI 모델은 고유한 특성을 가지고 있습니다. 
                분석 주제와 목적에 맞는 모델을 선택하여 최적의 결과를 얻으세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}