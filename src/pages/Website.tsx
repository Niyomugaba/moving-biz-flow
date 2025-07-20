
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Truck, 
  Users, 
  Shield, 
  Clock,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Website = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Residential Moving",
      description: "Complete home moving services from apartments to large houses",
      icon: <Truck className="h-8 w-8 text-primary" />,
      features: ["Packing Services", "Furniture Assembly", "Loading/Unloading"]
    },
    {
      title: "Commercial Moving",
      description: "Office relocations and business moving services",
      icon: <Users className="h-8 w-8 text-primary" />,
      features: ["Office Equipment", "Minimal Downtime", "Weekend Service"]
    },
    {
      title: "Local Moving",
      description: "Same-day local moves within Baton Rouge area",
      icon: <MapPin className="h-8 w-8 text-primary" />,
      features: ["Same Day Service", "Local Expertise", "Competitive Rates"]
    },
    {
      title: "Long Distance",
      description: "Interstate moving services across Louisiana and beyond",
      icon: <Shield className="h-8 w-8 text-primary" />,
      features: ["Interstate Licensed", "Tracking Available", "Insurance Coverage"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      text: "Bantu Movers made our relocation stress-free. Professional, efficient, and careful with our belongings."
    },
    {
      name: "Mike Rodriguez",
      rating: 5,
      text: "Best moving experience I've ever had. The team was punctual, friendly, and very professional."
    },
    {
      name: "Lisa Chen",
      rating: 5,
      text: "Highly recommend! They handled our office move perfectly with minimal business disruption."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/6319d82c-0bdd-465a-9925-c9401c11e50a.png" 
                alt="Bantu Movers Logo" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-primary">Bantu Movers</h1>
                <p className="text-sm text-muted-foreground">Professional Moving Services</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#services" className="text-foreground hover:text-primary transition-colors">Services</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
              
              {/* Portal Access Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Portal Login
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/manager-login')}>
                    <Shield className="h-4 w-4 mr-2" />
                    Manager Portal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/employee-portal')}>
                    <Users className="h-4 w-4 mr-2" />
                    Employee Portal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            Trusted Moving Company in Baton Rouge, LA
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Professional Moving Services You Can Trust
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            From local moves to long-distance relocations, Bantu Movers provides reliable, 
            professional moving services throughout Louisiana with care and precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2">
              <Phone className="h-5 w-5" />
              Get Free Quote
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
              View Services
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Successful Moves</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">5★</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">3+</div>
              <div className="text-muted-foreground">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Moving Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive moving solutions tailored to meet your specific needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Bantu Movers?</h2>
            <p className="text-xl text-muted-foreground">
              Professional, reliable, and customer-focused moving services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary rounded-lg p-3 flex-shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Fully Licensed & Insured</h3>
                <p className="text-muted-foreground">Complete protection for your belongings with full licensing and comprehensive insurance coverage.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary rounded-lg p-3 flex-shrink-0">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">On-Time Service</h3>
                <p className="text-muted-foreground">Punctual and reliable service that respects your schedule and timeline.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary rounded-lg p-3 flex-shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Experienced Team</h3>
                <p className="text-muted-foreground">Professional movers trained in proper handling techniques and customer service.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground">
              Real reviews from satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                  <p className="font-semibold">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Your Free Quote Today</h2>
            <p className="text-xl text-muted-foreground">
              Contact us for a personalized moving estimate
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary rounded-lg p-3">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p className="text-muted-foreground">(225) 555-MOVE</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-primary rounded-lg p-3">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-muted-foreground">info@bantumovers.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-primary rounded-lg p-3">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Service Area</p>
                      <p className="text-muted-foreground">Baton Rouge, LA & Surrounding Areas</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <a 
                    href="http://thumbtack.com/la/baton-rouge/moving-companies/bantu-movers/service/547406780080742407"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View us on Thumbtack
                  </a>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Request a Quote</CardTitle>
                  <CardDescription>Get a personalized estimate for your move</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <input 
                          type="text" 
                          className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input 
                          type="text"
                          className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input 
                        type="email"
                        className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input 
                        type="tel"
                        className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="(225) 555-0123"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Moving Details</label>
                      <textarea 
                        rows={4}
                        className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Tell us about your move (dates, locations, special requirements, etc.)"
                      ></textarea>
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Get Free Quote
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/lovable-uploads/6319d82c-0bdd-465a-9925-c9401c11e50a.png" 
                  alt="Bantu Movers Logo" 
                  className="h-8 w-auto"
                />
                <div>
                  <h3 className="font-bold text-primary">Bantu Movers</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional moving services in Baton Rouge, LA. Your trusted partner for residential and commercial moves.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Residential Moving</li>
                <li>Commercial Moving</li>
                <li>Local Moving</li>
                <li>Long Distance</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Our Team</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>(225) 555-MOVE</li>
                <li>info@bantumovers.com</li>
                <li>Baton Rouge, LA</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 mt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Bantu Movers. All rights reserved. | Licensed & Insured</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Website;
