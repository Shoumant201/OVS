import React from 'react'
import { Button } from './ui/button'
import { HelpCircle } from 'lucide-react'

const Footer = () => {
  return (
    <div>
      <footer className="border-t py-4 mt-auto bg-[#1e2a3a]">
        <div className=" container mx-auto px-4 flex flex-col md:flex-row items-center gap-2 justify-center">
          <div className="text-sm text-white">
            Copyright © 2025 Online Voting System |{" "}
            <a href="#" className="hover:underline">
              Terms of Service
            </a>{" "}
            |{" "}
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-orange-500 text-white hover:bg-orange-600 shadow-lg"
          >
            <HelpCircle className="h-6 w-6" />
            <span className="sr-only">Help</span>
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default Footer
