import { useNavigate } from 'react-router-dom'
import BlogAddForm from './BlogAddForm'

export default function BlogAddPage() {
  const navigate = useNavigate()
  return <BlogAddForm onSuccess={() => navigate('/', { replace: true })} />
}
