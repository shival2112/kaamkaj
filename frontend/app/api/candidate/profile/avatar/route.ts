import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, or WEBP allowed' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 2 MB)' }, { status: 400 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Create bucket if it doesn't exist yet
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.find(b => b.name === 'avatars')) {
      await admin.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: MAX_SIZE,
        allowedMimeTypes: ALLOWED_TYPES,
      });
    }

    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
    const path = `${user.id}/avatar.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await admin.storage
      .from('avatars')
      .upload(path, bytes, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error('[avatar upload]', uploadError);
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(path);

    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: publicUrl },
    });

    return NextResponse.json({ avatar: publicUrl });
  } catch (err) {
    console.error('[POST /api/candidate/profile/avatar]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
