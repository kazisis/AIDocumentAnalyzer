import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, CheckCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Task, Content } from "@shared/schema";

export default function ContentReview() {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: content = [] } = useQuery<Content[]>({
    queryKey: ["/api/tasks", selectedTaskId, "content"],
    enabled: !!selectedTaskId,
  });

  const selectedTask = tasks.find(task => task.id === selectedTaskId);
  const koreanBlogContent = content.find(c => c.type === 'korean_blog');

  const approveMutation = useMutation({
    mutationFn: async ({ contentId, content }: { contentId: number; content: string }) => {
      const response = await apiRequest("PATCH", `/api/content/${contentId}/approve`, { content });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "콘텐츠 승인 완료",
        description: "파생 콘텐츠 생성이 시작되었습니다. 배포 관리 탭에서 확인해주세요.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", selectedTaskId, "content"] });
    },
    onError: (error) => {
      toast({
        title: "승인 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ contentId, content }: { contentId: number; content: string }) => {
      const response = await apiRequest("PATCH", `/api/content/${contentId}`, { content });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "임시 저장 완료",
        description: "변경사항이 저장되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "저장 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const pendingTasks = tasks.filter(task => task.status === 'review_pending');

  const handleTaskSelect = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  const handleContentChange = (content: string) => {
    setEditorContent(content);
  };

  const handleSave = () => {
    if (koreanBlogContent) {
      saveMutation.mutate({
        contentId: koreanBlogContent.id,
        content: editorContent,
      });
    }
  };

  const handleApproval = () => {
    if (koreanBlogContent) {
      approveMutation.mutate({
        contentId: koreanBlogContent.id,
        content: editorContent,
      });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">콘텐츠 검수 및 승인</h2>
        <p className="text-gray-600">AI가 생성한 한글 블로그 콘텐츠를 검토하고 수정한 후 최종 승인하세요.</p>
      </div>

      {/* Task Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>검수 대기 중인 작업</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">검수 대기 중인 작업이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskSelect(task)}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTaskId === task.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{task.topic}</h4>
                      <p className="text-sm text-gray-500">
                        생성됨: {new Date(task.createdAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-warning text-white text-sm rounded-full">검수 대기</span>
                    <i className="fas fa-chevron-right text-primary"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Editor */}
      {selectedTask && koreanBlogContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>한글 블로그 마스터 콘텐츠</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">마지막 저장:</span>
                <span className="text-sm font-medium text-gray-700">
                  {new Date(koreanBlogContent.updatedAt).toLocaleString('ko-KR')}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              initialContent={koreanBlogContent.content}
              onChange={handleContentChange}
            />

            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saveMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                임시 저장
              </Button>
              <Button
                onClick={handleApproval}
                disabled={approveMutation.isPending}
                className="bg-accent hover:bg-accent-light"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                최종 승인 및 파생 콘텐츠 생성
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
