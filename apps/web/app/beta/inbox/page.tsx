"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  CheckCircle, 
  Clock, 
  Send, 
  X, 
  Edit, 
  Plus,
  Bot
} from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { updateInboxDraft, createInboxDraft, generateSampleDrafts } from "@/lib/mock/api";
import type { InboxDraft, InboxStatus, InboxTriggerType } from "@/lib/mock/types";

export default function BetaInbox() {
  const { state, dispatch } = useMockStore();
  const [activeTab, setActiveTab] = useState<string>("needs_review");
  const [editingDraft, setEditingDraft] = useState<InboxDraft | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  const getTriggerTypeColor = (type: InboxTriggerType) => {
    switch (type) {
      case 'welcome': return 'bg-blue-100 text-blue-800';
      case 'streak_protect': return 'bg-orange-100 text-orange-800';
      case 'pre_session': return 'bg-green-100 text-green-800';
      case 'no_show_recovery': return 'bg-red-100 text-red-800';
      case 'milestone': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: InboxStatus) => {
    switch (status) {
      case 'needs_review': return <Mail className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
    }
  };

  const handleStatusChange = async (draft: InboxDraft, newStatus: InboxStatus) => {
    const updatedDraft = {
      ...draft,
      status: newStatus,
      ...(newStatus === 'sent' && { sentAt: new Date().toISOString() }),
    };

    await updateInboxDraft(updatedDraft);
    dispatch({ type: 'UPDATE_INBOX_DRAFT', payload: updatedDraft });
  };

  const handleEditDraft = (draft: InboxDraft) => {
    setEditingDraft(draft);
    setEditContent(draft.fullContent);
  };

  const handleSaveEdit = async () => {
    if (!editingDraft) return;

    const updatedDraft = {
      ...editingDraft,
      fullContent: editContent,
      previewText: editContent.substring(0, 100) + '...',
    };

    await updateInboxDraft(updatedDraft);
    dispatch({ type: 'UPDATE_INBOX_DRAFT', payload: updatedDraft });
    setEditingDraft(null);
    setEditContent("");
  };

  const handleGenerateSamples = async () => {
    const samples = await generateSampleDrafts();
    samples.forEach(draft => {
      dispatch({ type: 'ADD_INBOX_DRAFT', payload: draft });
    });
    setShowGenerateDialog(false);
  };

  const getDraftsByStatus = (status: InboxStatus) => {
    return state.inboxDrafts.filter(draft => draft.status === status);
  };

  const getUserName = (userId: string) => {
    const user = state.users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bot className="h-8 w-8" />
            AI Inbox
          </h1>
          <p className="text-muted-foreground">Review and manage AI-generated messages</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowGenerateDialog(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Generate Sample Drafts
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="needs_review" className="gap-2">
            <Mail className="h-4 w-4" />
            Needs Review ({getDraftsByStatus('needs_review').length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Clock className="h-4 w-4" />
            Scheduled ({getDraftsByStatus('scheduled').length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-4 w-4" />
            Sent ({getDraftsByStatus('sent').length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <X className="h-4 w-4" />
            Rejected ({getDraftsByStatus('rejected').length})
          </TabsTrigger>
        </TabsList>

        {(['needs_review', 'scheduled', 'sent', 'rejected'] as InboxStatus[]).map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {getDraftsByStatus(status).length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-muted-foreground">
                  {getStatusIcon(status)}
                  <p className="mt-2">No drafts in {status.replace('_', ' ')} status</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {getDraftsByStatus(status).map((draft) => (
                  <Card key={draft.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{draft.subject}</h3>
                            <Badge className={getTriggerTypeColor(draft.triggerType)}>
                              {draft.triggerType.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            To: {getUserName(draft.targetUserId)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {draft.previewText}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(draft.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {status === 'needs_review' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(draft, 'scheduled')}
                              className="gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditDraft(draft)}
                              className="gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusChange(draft, 'rejected')}
                              className="gap-1"
                            >
                              <X className="h-3 w-3" />
                              Reject
                            </Button>
                          </>
                        )}

                        {status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(draft, 'sent')}
                            className="gap-1"
                          >
                            <Send className="h-3 w-3" />
                            Send via GHL
                          </Button>
                        )}

                        {(status === 'sent' || status === 'rejected') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditDraft(draft)}
                            className="gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingDraft} onOpenChange={() => setEditingDraft(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Draft</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <p className="text-sm text-muted-foreground">{editingDraft?.subject}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[200px] mt-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingDraft(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Samples Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Sample Drafts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              This will generate sample AI drafts for testing purposes.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateSamples}>
                Generate Samples
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
