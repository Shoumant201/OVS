interface SectionHeaderProps {
    title: string
    description: string
  }
  
  export function SectionHeader({ title, description }: SectionHeaderProps) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
      </div>
    )
  }
  
  