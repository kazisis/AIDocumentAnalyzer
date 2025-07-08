import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lightbulb, Database, Scale, Eye, Cog, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LLMSettings from "@/components/llm-settings";

const taskSchema = z.object({
  topic: z.string().min(1, "분석 주제는 필수입니다"),
  sourceUrl: z.string().url("올바른 URL을 입력해주세요").optional().or(z.literal("")),
  sourceText: z.string().optional(),
  comparison: z.string().optional(),
  requirements: z.string().min(1, "핵심 관점/요청사항은 필수입니다"),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function TaskCreation() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      topic: "",
      sourceUrl: "",
      sourceText: "",
      comparison: "",
      requirements: "",
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "작업 생성 완료",
        description: "AI 분석이 시작되었습니다. 완료되면 콘텐츠 검수 탭에서 확인할 수 있습니다.",
      });
      form.reset();
      setIsProcessing(true);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      // Simulate processing time for demo
      setTimeout(() => {
        setIsProcessing(false);
        toast({
          title: "AI 분석 완료",
          description: "생성된 콘텐츠를 검수해주세요.",
        });
      }, 5000);
    },
    onError: (error) => {
      toast({
        title: "작업 생성 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">새 작업 생성</h2>
        <p className="text-gray-600">AI 분석을 위한 정보를 입력하고 한글 블로그 콘텐츠를 생성하세요.</p>
      </div>

      <div className="mb-6">
        <LLMSettings />
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>📋 작업 생성 안내:</strong> 선택한 AI 모델과 입력한 자료를 바탕으로 전문적인 한글 블로그 콘텐츠를 생성합니다. 
          생성된 콘텐츠는 검수 후 승인을 거쳐 다양한 플랫폼용 파생 콘텐츠로 확장됩니다.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-warning" />
                          분석 주제
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="예: 2024년 전기차 시장 트렌드 분석"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="sourceUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-primary" />
                          핵심 데이터/소스 - URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="URL 링크 입력"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="mt-3">
                    <FormField
                      control={form.control}
                      name="sourceText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-primary" />
                            핵심 데이터/소스 - 텍스트
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="URL 대신 직접 텍스트로 자료를 입력하세요 (기사 내용, 데이터, 보고서 등) - 최대 50,000자"
                              rows={10}
                              className="resize-y min-h-[200px]"
                              maxLength={50000}
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500 mt-1">
                            {field.value?.length || 0}/50,000자 (최소 20,000자 이상 권장)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-3">
                    <Label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <i className="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-2"></i>
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">파일 업로드</span> 또는 드래그 앤 드롭
                        </p>
                        <p className="text-xs text-gray-500">PDF, Excel, Word 파일 지원 (향후 업데이트)</p>
                      </div>
                      <input type="file" className="hidden" />
                    </Label>
                  </div>
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="comparison"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-accent" />
                          비교 분석 대상 (선택사항)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="예: 테슬라 vs 현대차 전기차 판매량 비교"
                            rows={4}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="lg:col-span-2">
                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-secondary" />
                          핵심 관점/요청사항
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="어떤 관점에서 분석하고 어떤 인사이트를 도출하고 싶은지 상세히 설명해주세요."
                            rows={4}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Cog className="mr-2 h-4 w-4" />
                  AI 분석 요청
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Processing Status */}
      {(isProcessing || createTaskMutation.isPending) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">AI 분석 진행 중</h3>
                <p className="text-gray-600">
                  입력하신 정보를 바탕으로 전문적인 한글 블로그 콘텐츠를 생성하고 있습니다...
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-500 w-2/3"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">예상 완료 시간: 약 2-3분</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
