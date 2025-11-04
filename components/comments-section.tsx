"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, ThumbsUp, MoreVertical, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Comment {
  id: string
  content: string
  user_id: string
  user?: {
    name: string
    email: string
    avatar?: string
  }
  created_at: string
  updated_at?: string
  is_edited?: boolean
  parent_id?: string
  reactions?: Array<{
    id: string
    reaction_type: string
    user_id: string
  }>
}

interface CommentsSectionProps {
  entityType: 'purchase_request' | 'work_submission' | 'task' | 'leave_request'
  entityId: string
}

export function CommentsSection({ entityType, entityId }: CommentsSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!entityId) return

    const loadComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            user:user_id (
              id,
              name,
              email,
              avatar
            )
          `)
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .is('parent_id', null) // Only top-level comments
          .order('created_at', { ascending: true })

        if (error) throw error

        // Load replies for each comment
        const commentsWithReplies = await Promise.all(
          (data || []).map(async (comment) => {
            const { data: replies } = await supabase
              .from('comments')
              .select(`
                *,
                user:user_id (
                  id,
                  name,
                  email,
                  avatar
                )
              `)
              .eq('parent_id', comment.id)
              .order('created_at', { ascending: true })

            return {
              ...comment,
              replies: replies || []
            }
          })
        )

        setComments(commentsWithReplies as any)
      } catch (error) {
        console.error('Error loading comments:', error)
      } finally {
        setLoading(false)
      }
    }

    loadComments()

    // Subscribe to new comments
    const subscription = supabase
      .channel(`comments_${entityType}_${entityId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `entity_type=eq.${entityType} AND entity_id=eq.${entityId}`
      }, () => {
        loadComments()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [entityType, entityId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          user_id: user.id,
          content: newComment,
          parent_id: replyingTo || null
        })
        .select()
        .single()

      if (error) throw error

      setNewComment('')
      setReplyingTo(null)
      
      // Reload comments
      const { data: updatedComments } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id (
            id,
            name,
            email,
            avatar
          )
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .is('parent_id', null)
        .order('created_at', { ascending: true })

      setComments(updatedComments || [])
    } catch (error) {
      console.error('Error posting comment:', error)
      alert('Failed to post comment. Please try again.')
    }
  }

  const handleEdit = async (commentId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({
          content: newContent,
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', commentId)

      if (error) throw error

      setEditingId(null)
      // Reload comments
      window.location.reload() // Simple refresh, could be optimized
    } catch (error) {
      console.error('Error editing comment:', error)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      // Reload comments
      window.location.reload()
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <div className="flex justify-between items-center">
          {replyingTo && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
            >
              Cancel reply
            </Button>
          )}
          <Button type="submit" size="sm" disabled={!newComment.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Post
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id}>
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={comment.user?.avatar} />
                    <AvatarFallback>
                      {comment.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="font-semibold text-sm">{comment.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          {comment.is_edited && ' (edited)'}
                        </p>
                      </div>
                      {user?.id === comment.user_id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setEditingId(comment.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(comment.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {editingId === comment.id ? (
                      <div className="space-y-2 mt-2">
                        <Textarea
                          defaultValue={comment.content}
                          rows={3}
                          id={`edit-${comment.id}`}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const textarea = document.getElementById(`edit-${comment.id}`) as HTMLTextAreaElement
                              if (textarea) {
                                handleEdit(comment.id, textarea.value)
                              }
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm mt-2 whitespace-pre-wrap">{comment.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(comment.id)}
                          >
                            Reply
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            0
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Replies */}
            {(comment as any).replies?.map((reply: Comment) => (
              <Card key={reply.id} className="ml-12 mt-2">
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reply.user?.avatar} />
                      <AvatarFallback>
                        {reply.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="font-semibold text-xs">{reply.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mt-1">{reply.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  )
}

